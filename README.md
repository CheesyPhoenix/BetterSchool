# [BetterSchool](https://betterschool.cheesyphoenix.tk)

![betterschool-icon-192](https://user-images.githubusercontent.com/30808373/185181607-1bd61fa3-92dd-4413-b342-7d26861f39b9.png)

## **Hello everyone!**

Do you suffer from having to log in multiple times a day to Visma Inschool? Do you experience extreme bouts of _rage_ and _frustration_ due to this severe issue?

## **Well suffer no more!**

With our revoultionary technology you will never have to log in again. We have developed a web app that saves time _and_ money. This app will show you your schedule with out _wasting_ you precious time. The app even works offline and is availiable on both **PC** and **Mobile**.

## **Where can I get this magical app?**

Thats easy. Just head to https://betterschool.cheesyphoenix.tk and simply download the website as an app.

<br>

# For Developers

## API documentation

The BetterSchool API is completely open and is hosted at `https://api.betterschool.chph.tk/` (both `...chph.tk` and `...cheesyphoenix.tk` works).
See [the documentation page](https://doc.api.betterschool.chph.tk) for usage.

<br>

## Self hosting

Both the API and the website can be self-hosted, primarily using docker, however if you want to deploy using a different method you are free to do so.

All of the docker images are hosted on a custom docker registry at `docker.chph.tk` if for some reason you can't access the images you will have to build them yourself using the dockerfiles in the repo.

### Docker

<details>
<summary><h3>API</h3></summary>

Run with:

Linux:

```
docker run \
-p 8080:8080 \
-v betterschool-api-data:/src/creds \
-e iv={INSERT RANDOM 16 CHARACTER STRING HERE} \
-e key={INSERT RANDOM 32 CHARACTER STRING HERE} \
--restart unless-stopped \
-d \
docker.chph.tk/cheesyphoenix/betterschool-api:latest
```

One liner:

```
docker run -p 8080:8080 -v betterschool-api-data:/src/creds -e iv={INSERT RANDOM 16 CHARACTER STRING HERE} -e key={INSERT RANDOM 32 CHARACTER STRING HERE} --restart unless-stopped -d docker.chph.tk/cheesyphoenix/betterschool-api:latest
```

</details>

<details>
<summary><h3>Web</h3></summary>

Run with:

Linux:

```
docker run \
-p 80:80 \
--restart unless-stopped \
-e VITE_API_LOC={INSERT URL OF YOUR API HERE OR REMOVE THIS ARG TO USE THE OFFICIAL API} \
-d \
docker.chph.tk/cheesyphoenix/betterschool-web:latest
```

One liner:

```
docker run -p 80:80 --restart unless-stopped -e VITE_API_LOC={INSERT URL OF YOUR API HERE OR REMOVE THIS ARG TO USE THE OFFICIAL API} -d docker.chph.tk/cheesyphoenix/betterschool-web:latest
```

</details>
