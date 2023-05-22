FROM tensorflow/tensorflow:1.15.0-py3

ARG GPT_TOKEN
ARG SLACK_TOKEN

ENV GPT_TOKEN=${GPT_TOKEN}
ENV SLACK_TOKEN=${SLACK_TOKEN}

ENV LC_ALL C.UTF-8
# install system packages
ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get clean \
 && apt-get update --fix-missing \
 && apt-get install -y \
    software-properties-common 


RUN apt-get clean \
 && add-apt-repository 'deb http://security.ubuntu.com/ubuntu xenial-security main' \
 && apt-get update --fix-missing \
 && apt-get install -y \
    git \
    curl \
    gcc \
    build-essential \
    tcl \
    g++ \
    zlib1g-dev \
    libjpeg8-dev \
    libtiff5-dev \
    libjasper-dev \
    libpng12-dev \
    tcl-dev \
    tk-dev \
    python3 \
    python3-pip \
    python3-tk \
    ghostscript \
    openjdk-8-jre \
    poppler-utils \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    wget

WORKDIR /work

ADD ./deepfigures-open/requirements.txt /work/deepfigures-open

RUN pip3 install --upgrade pip \
 && pip install Cython==0.25.2
RUN pip3 install -r ./deepfigures-open/requirements.txt

RUN apt-get update \
 && apt-get install -y openjdk-11-jdk 

RUN apt-get update \
 && apt-get install -y apt-transport-https curl gnupg -yqq \
 && echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | tee /etc/apt/sources.list.d/sbt.list \
 && echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | tee /etc/apt/sources.list.d/sbt_old.list \
 && curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | gpg --no-default-keyring --keyring gnupg-ring:/etc/apt/trusted.gpg.d/scalasbt-release.gpg --import \
 && chmod 644 /etc/apt/trusted.gpg.d/scalasbt-release.gpg \
 && apt-get update \
 && apt-get install -y sbt 

COPY ./deepfigures-open/pdffigures2-assembly-0.1.0.jar /work/deepfigures-open/bin/pdffigures2-assembly-0.0.12-SNAPSHOT.jar

RUN wget "https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/deepfigures/weights.tar.gz" \
 && tar -xf weights.tar.gz -C ./deepfigures-open

ADD ./deepfigures-open/vendor/tensorboxresnet /work/deepfigures-open/vendor/tensorboxresnet
RUN pip3 install -e /work/deepfigures-open/vendor/tensorboxresnet

RUN pip3 install --quiet -e /work/deepfigures-open

# Node js stuff

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash \
 && . ~/.nvm/nvm.sh \
 && nvm install 14 \
 && nvm alias default 14 \
 && nvm use default
ENV NODE_PATH /root/.nvm/v14.17.0/lib/node_modules
ENV PATH $PATH:/root/.nvm/versions/node/v14.17.0/bin
COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]
