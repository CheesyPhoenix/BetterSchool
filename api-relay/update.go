package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// GET /classes
func getDataClasses() []string {
	res, err := http.Get("https://api.betterschool.cheesyphoenix.tk/classes")
	if err != nil {
		fmt.Println(err)
		return nil
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return nil
	}

	var classes []string

	err = json.Unmarshal(body, &classes)
	if err != nil {
		fmt.Println(err)
		return nil
	}

	defer res.Body.Close()

	return classes
}

// GET /:class

func getDataClass(class string) string {
	res, err := http.Get("https://api.betterschool.cheesyphoenix.tk/" + class)
	if err != nil {
		fmt.Println(err)
		return ""
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return ""
	}

	classData := string(body)

	defer res.Body.Close()

	return classData
}
