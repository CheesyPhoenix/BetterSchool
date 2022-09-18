package main

import (
	"bytes"
	"fmt"
	"net/http"
)

// // GET /classes
// func getDataClasses() []string {
// 	res, err := http.Get(baseURL + "classes")
// 	if err != nil {
// 		fmt.Println(err)
// 		return nil
// 	}

// 	body, err := io.ReadAll(res.Body)
// 	if err != nil {
// 		fmt.Println(err)
// 		return nil
// 	}

// 	var classes []string

// 	err = json.Unmarshal(body, &classes)
// 	if err != nil {
// 		fmt.Println(err)
// 		return nil
// 	}

// 	defer res.Body.Close()

// 	return classes
// }

// GET /:class

// func getDataClass(class string) string {
// 	res, err := http.Get(baseURL + class)
// 	if err != nil {
// 		fmt.Println(err)
// 		return ""
// 	}

// 	body, err := io.ReadAll(res.Body)
// 	if err != nil {
// 		fmt.Println(err)
// 		return ""
// 	}

// 	classData := string(body)

// 	defer res.Body.Close()

// 	return classData
// }

// POST /addUser
func addUserSend(body []byte) *http.Response {
	res, err := http.Post(baseURL+"addUser", "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println(err)
		return nil
	}

	return res
}
