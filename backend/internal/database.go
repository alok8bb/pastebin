package database

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var errMissingDatabaseURL = errors.New("DATABASE_URL is required")
var ErrPasteNotFound = errors.New("paste not found")

type Store struct {
	pool *pgxpool.Pool
}

type Paste struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

func Open(ctx context.Context, connectionString string) (*Store, error) {
	if connectionString == "" {
		return nil, errMissingDatabaseURL
	}

	config, err := pgxpool.ParseConfig(connectionString)
	if err != nil {
		return nil, err
	}
	config.MaxConns = 10

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	if _, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS pastes (
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		pool.Close()
		return nil, err
	}

	return &Store{pool: pool}, nil
}

func (s *Store) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

func (s *Store) Close() {
	s.pool.Close()
}

func (s *Store) CreatePaste(ctx context.Context, content string) (Paste, error) {
	var idBytes [16]byte
	if _, err := rand.Read(idBytes[:]); err != nil {
		return Paste{}, err
	}

	paste := Paste{ID: hex.EncodeToString(idBytes[:]), Content: content}
	err := s.pool.QueryRow(ctx,
		`INSERT INTO pastes (id, content) VALUES ($1, $2) RETURNING created_at`,
		paste.ID,
		paste.Content,
	).Scan(&paste.CreatedAt)
	return paste, err
}

func (s *Store) GetPaste(ctx context.Context, id string) (Paste, error) {
	var paste Paste
	err := s.pool.QueryRow(ctx,
		`SELECT id, content, created_at FROM pastes WHERE id = $1`,
		id,
	).Scan(&paste.ID, &paste.Content, &paste.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Paste{}, ErrPasteNotFound
	}
	return paste, err
}
