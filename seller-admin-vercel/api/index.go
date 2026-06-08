package handler

import (
	"context"
	"log"
	"net/http"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
	"roastbyjaden/selleradmin/app"
)

var (
	handlerOnce sync.Once
	handlerMux  http.Handler
	handlerErr  error
)

func Handler(w http.ResponseWriter, r *http.Request) {
	handlerOnce.Do(func() {
		cfg, err := app.LoadConfig()
		if err != nil {
			handlerErr = err
			return
		}

		pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
		if err != nil {
			handlerErr = err
			return
		}

		server := app.NewServer(cfg, app.NewStore(pool))
		handlerMux = server.Handler()
	})

	if handlerErr != nil {
		log.Printf("seller admin api setup failed: %v", handlerErr)
		http.Error(w, "API setup failed.", http.StatusInternalServerError)
		return
	}

	handlerMux.ServeHTTP(w, r)
}
