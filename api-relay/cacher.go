package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type CacheItem struct {
	timeCached int64
	data       string
}

var cache map[string]CacheItem = make(map[string]CacheItem)

func cachedRequest(w http.ResponseWriter, r *http.Request) {
	if val, exists := cache[r.URL.String()]; exists && val.timeCached > time.Now().UnixMilli()+1000*60*5 {
		w.Write([]byte(val.data))
	} else {
		res, err := http.Get(baseURL + strings.Join(strings.Split(strings.Replace(r.URL.String(), "://", "", -1), "/")[1:], "/"))
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(500)
			return
		}

		body, err := io.ReadAll(res.Body)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(500)
			return
		}

		if res.StatusCode == 200 {
			w.Write(body)
			cache[r.URL.String()] = CacheItem{timeCached: time.Now().UnixMilli(), data: string(body)}
		} else {
			w.WriteHeader(res.StatusCode)
			w.Write(body)
		}
	}
}
