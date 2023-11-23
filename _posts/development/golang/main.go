package main

import "fmt"

type User[T any, B any] struct {
	name T
	age  B
}

func main() {

	userTest := User[string, int64]{
		name: "joao",
		age:  20,
	}

	fmt.Println(userTest)
}
