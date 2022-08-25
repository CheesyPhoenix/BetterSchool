# [BetterSchool](https://betterschool.cheesyphoenix.tk)

![betterschool-icon-192](https://user-images.githubusercontent.com/30808373/185181607-1bd61fa3-92dd-4413-b342-7d26861f39b9.png)

## **Hello everyone!**

Do you suffer from having to log in multiple times a day to Visma Inschool? Do you experience extreme bouts of *rage* and *frustration* due to this severe issue?


## **Well suffer no more!**

With our revoultionary technology you will never have to log in again. We have developed a web app that saves time *and* money. This app will show you your schedule with out *wasting* you precious time. The app even works offline and is availiable on both **PC** and **Mobile**.

## **Where can I get this magical app?**

Thats easy. Just head to https://betterschool.cheesyphoenix.tk and simply download the website as an app.

<br>

# For Developers

## API documentation

The BetterSchool API is completely open and is hosted at ```https://api.betterschool.cheesyphoenix.tk/```. 

Both the API and the website can be self-hosted, documentation for this will eventiually be created.


### Usage

All API communication takes place using JSON

The API exposes three endpoints: 

<br>

```/classes [GET]```

Response: 
```TypeScript
const response: string[];
```

This is used to get a list of all classes in the API's database

<br>

```/:class [GET]``` 

Where "class" is a valid class gotten from /classes
e.g. ```[GET] /2ITKA```

Response: 
```TypeScript
interface Week {
  weekNr: string;
  days: {
    name: string;
    date: string;
    classes: {
      date: string;
      time: string;
      room: string;
      name: string;
    }[];
  }[];
}
  
const response: Week[];
```

<br>

```/addUser [POST]``` 

Where the request body is of type:
```TypeScript
interface body {
  username: string,
  pass: string,
  class: string,
}
```

On success this will return status ```200``` <br>
On an incorrectly formatted body object it will return status ```400``` <br>
On verification failure it will return status ```401``` <br>

