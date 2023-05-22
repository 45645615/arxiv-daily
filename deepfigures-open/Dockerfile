# image for running DeepFigures

FROM tensorflow/tensorflow:1.15.0-py3

ENV LC_ALL C.UTF-8

# install system packages
ENV TZ=Asia/Dubai
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

# install python packages

ADD ./requirements.txt /work

RUN pip3 install --upgrade pip \
 && pip install Cython==0.25.2
RUN pip3 install -r ./requirements.txt

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

COPY pdffigures2-assembly-0.1.0.jar /work/bin/pdffigures2-assembly-0.0.12-SNAPSHOT.jar

RUN wget "https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/deepfigures/weights.tar.gz" \
 && tar -xf weights.tar.gz

ADD ./vendor/tensorboxresnet /work/vendor/tensorboxresnet
RUN pip3 install -e /work/vendor/tensorboxresnet

ADD . /work


RUN pip3 install --quiet -e /work
CMD [ "/bin/bash" ]
