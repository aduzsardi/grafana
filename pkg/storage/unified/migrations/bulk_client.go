package migrations

import (
	"fmt"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/grafana/grafana/pkg/storage/unified/resourcepb"
)

// errBatchedStreamUnimplemented is returned when the server does not support
// BulkProcessBatched. The caller should retry using the legacy BulkProcess RPC.
type errBatchedStreamUnimplemented struct{ cause error }

func (e *errBatchedStreamUnimplemented) Error() string {
	return fmt.Sprintf("BulkProcessBatched not supported by server: %v", e.cause)
}
func (e *errBatchedStreamUnimplemented) Unwrap() error { return e.cause }

const (
	defaultBulkProcessBatchMaxItems = 1000
	defaultBulkProcessBatchMaxBytes = 2 * 1024 * 1024
)

type bulkProcessBatchOptions struct {
	MaxItems int
	MaxBytes int
}

func defaultBulkProcessBatchOptions() bulkProcessBatchOptions {
	return bulkProcessBatchOptions{
		MaxItems: defaultBulkProcessBatchMaxItems,
		MaxBytes: defaultBulkProcessBatchMaxBytes,
	}
}

type bulkProcessBatchingClient struct {
	resourcepb.BulkStore_BulkProcessBatchedClient

	maxItems int
	maxBytes int

	batch     []*resourcepb.BulkRequest
	batchSize int
}

func newBulkProcessBatchingClient(stream resourcepb.BulkStore_BulkProcessBatchedClient, opts bulkProcessBatchOptions) resourcepb.BulkStore_BulkProcessClient {
	if opts.MaxItems <= 0 {
		opts.MaxItems = defaultBulkProcessBatchMaxItems
	}
	if opts.MaxBytes <= 0 {
		opts.MaxBytes = defaultBulkProcessBatchMaxBytes
	}

	return &bulkProcessBatchingClient{
		BulkStore_BulkProcessBatchedClient: stream,
		maxItems:                           opts.MaxItems,
		maxBytes:                           opts.MaxBytes,
	}
}

func (c *bulkProcessBatchingClient) Send(req *resourcepb.BulkRequest) error {
	if req == nil {
		return fmt.Errorf("missing bulk request")
	}

	c.batch = append(c.batch, req)
	c.batchSize += len(req.Value)

	if len(c.batch) >= c.maxItems || c.batchSize >= c.maxBytes {
		return c.flush()
	}

	return nil
}

func (c *bulkProcessBatchingClient) CloseAndRecv() (*resourcepb.BulkResponse, error) {
	if err := c.flush(); err != nil {
		return nil, err
	}

	resp, err := c.BulkStore_BulkProcessBatchedClient.CloseAndRecv()
	if err != nil {
		if status.Code(err) == codes.Unimplemented {
			return nil, &errBatchedStreamUnimplemented{cause: err}
		}
		return nil, err
	}
	return resp, nil
}

func (c *bulkProcessBatchingClient) flush() error {
	if len(c.batch) == 0 {
		return nil
	}

	batch := &resourcepb.BulkRequestBatch{Items: c.batch}
	c.batch = nil
	c.batchSize = 0

	if err := c.BulkStore_BulkProcessBatchedClient.Send(batch); err != nil {
		if status.Code(err) == codes.Unimplemented {
			return &errBatchedStreamUnimplemented{cause: err}
		}
		return err
	}
	return nil
}
