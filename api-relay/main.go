package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var classes []string
var classData map[string]string
var baseURL string

func main() {
	fmt.Println("Starting...")

	fmt.Println("Got args: ", os.Args[1:])

	args := toStringArray(os.Args)

	if args.includes("--api-addr") {
		if args.indexOf("--api-addr")+1 < len(args) {
			baseURL = args[args.indexOf("--api-addr")+1]
			if string(baseURL[len(baseURL)-1]) != "/" {
				baseURL += "/"
			}

			fmt.Print("\n\033[0;34mRunning in custom api address mode. Using address: " + args[args.indexOf("--api-addr")+1] + "\033[0m\n\n")
		} else {
			fmt.Println("\033[0;31m" + "Err. Flag '--api-addr' needs 1 argument" + "\033[0m")
			baseURL = "https://api.betterschool.cheesyphoenix.tk/"
		}
	} else {
		baseURL = "https://api.betterschool.cheesyphoenix.tk/"
	}

	go update()

	handleRequests()
}

func update() {
	initial := true

	for {
		if !initial {
			time.Sleep(20 * time.Minute)
		}
		initial = false

		fmt.Println("Updating data")

		if len(getDataClasses()) > 0 {
			classes = getDataClasses()
		}

		tempClassData := make(map[string]string)
		for i := 0; i < len(classes); i++ {
			tempClassData[classes[i]] = getDataClass(classes[i])
		}

		if len(tempClassData) > 0 {
			classData = tempClassData
		}

		fmt.Println("Update complete")
	}
}

func handleRequests() {
	http.HandleFunc("/", reqManager)

	log.Fatal(http.ListenAndServe(":8081", nil))
}

func reqManager(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Method, r.URL.Path)

	//allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS,POST")

	if r.Method == "GET" {
		if r.URL.Path == "/classes" {
			getClasses(w, r)
		} else if r.URL.Path != "/" {
			getClass(w, r)
		} else {
			w.WriteHeader(404)
		}
	} else if r.Method == "POST" {
		if r.URL.Path == "/addUser" {
			postAddUser(w, r)
		} else {
			w.WriteHeader(404)
		}
	} else if r.Method == "OPTIONS" {
		w.WriteHeader(200)
	} else {
		w.WriteHeader(404)
	}
}

func getClass(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(classData[strings.Replace(string(r.URL.Path), "/", "", -1)]))
}

func getClasses(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(classes)
}

func postAddUser(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		return
	}

	res := addUserSend(body)

	body, err = io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		return
	}

	w.WriteHeader(res.StatusCode)
	w.Write(body)
}
