FROM denoland/deno

WORKDIR /app

USER root

RUN deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN deno cache main.ts
RUN deno cache dataManager.ts
RUN deno cache idManager.ts
RUN deno cache scraper.ts


EXPOSE 8080:8080

CMD [ "run", "-A", "main.ts" ]