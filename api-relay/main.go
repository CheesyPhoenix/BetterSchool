package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

var classes []string
var classData map[string]string
var proxy *httputil.ReverseProxy

func main() {
	fmt.Println("Starting...")

	go update()

	handleRequests()
}

func update() {
	initial := true

	for {
		if !initial {
			time.Sleep(60 * time.Second)
		}
		initial = false

		fmt.Println("Updating data")

		classes = getDataClasses()

		tempClassData := make(map[string]string)
		for i := 0; i < len(classes); i++ {
			tempClassData[classes[i]] = getDataClass(classes[i])
		}
		classData = tempClassData

		fmt.Println("Update complete")
	}
}

func handleRequests() {
	http.HandleFunc("/", reqManager)

	URL, err := url.Parse("https://api.betterschool.cheesyphoenix.tk/addUser")
	if err == nil {
		proxy = httputil.NewSingleHostReverseProxy(URL)
	} else {
		fmt.Println(err)
	}

	log.Fatal(http.ListenAndServe("localhost:8080", nil))
}

func reqManager(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Method, r.URL.Path)

	if r.Method == "GET" {
		if r.URL.Path == "/classes" {
			getClasses(w, r)
		} else if r.URL.Path != "/" {
			getClass(w, r)
		}
	} else if r.Method == "POST" {
		if r.URL.Path == "/addUser" {
			proxy.ServeHTTP(w, r)
		}
	}
}

func getClass(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(classData[strings.Replace(string(r.URL.Path), "/", "", -1)]))
}

func getClasses(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(classes)
}
