package main

type StringArray []string

func (arr StringArray) includes(element interface{}) bool {
	doesInclude := false
	for i := 0; i < len(arr); i++ {
		if arr[i] == element {
			doesInclude = true
		}
	}

	return doesInclude
}

func (arr StringArray) indexOf(element interface{}) int {
	for i := 0; i < len(arr); i++ {
		if arr[i] == element {
			return i
		}
	}

	return -1
}

func toStringArray(array []string) StringArray {
	return append(StringArray{}, array...)
}
