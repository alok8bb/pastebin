package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-enry/go-enry/v2"

	"pastebin/backend/internal"
)

const maxPasteSize = 1 << 20

type healthResponse struct {
	Status string `json:"status"`
	Name   string `json:"name"`
}

type pasteResponse struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	Language  string    `json:"language"`
}

func responseForPaste(paste database.Paste) pasteResponse {
	language := detectLanguage(paste.Content)

	return pasteResponse{
		ID:        paste.ID,
		Content:   paste.Content,
		CreatedAt: paste.CreatedAt,
		Language:  language,
	}
}

func detectLanguage(content string) string {
	if language := enry.GetLanguage("", []byte(content)); language != "" {
		return language
	}
	return "Plain text"
}

func registerRoutes(mux *http.ServeMux, db *database.Store) {
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		if err := db.Ping(ctx); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(healthResponse{Status: "unavailable", Name: "Pastebin by Suvi"})
			return
		}

		_ = json.NewEncoder(w).Encode(healthResponse{Status: "ok", Name: "Pastebin by Suvi"})
	})
	mux.HandleFunc("POST /api/v1/pastes", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		r.Body = http.MaxBytesReader(w, r.Body, maxPasteSize)

		var request struct {
			Content string `json:"content"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&request); err != nil {
			var maxBytesError *http.MaxBytesError
			if errors.As(err, &maxBytesError) {
				writeError(w, http.StatusRequestEntityTooLarge, "paste is too large")
				return
			}
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		if err := decoder.Decode(&struct{}{}); err != io.EOF {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		if strings.TrimSpace(request.Content) == "" {
			writeError(w, http.StatusBadRequest, "content is required")
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()
		paste, err := db.CreatePaste(ctx, request.Content)
		if err != nil {
			log.Printf("create paste: %v", err)
			writeError(w, http.StatusInternalServerError, "could not create paste")
			return
		}

		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(responseForPaste(paste))
	})
	mux.HandleFunc("GET /api/v1/pastes/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		paste, err := db.GetPaste(ctx, r.PathValue("id"))
		if errors.Is(err, database.ErrPasteNotFound) {
			writeError(w, http.StatusNotFound, "paste not found")
			return
		}
		if err != nil {
			log.Printf("get paste: %v", err)
			writeError(w, http.StatusInternalServerError, "could not retrieve paste")
			return
		}

		_ = json.NewEncoder(w).Encode(responseForPaste(paste))
	})
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}
