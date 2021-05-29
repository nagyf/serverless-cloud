FROM openjdk:11-jdk-slim as base

WORKDIR /usr/src

COPY ./pom.xml ./pom.xml
COPY ./mvnw ./mvnw
COPY ./.mvn ./.mvn
COPY ./src ./src

RUN ["./mvnw", "package"]

FROM openjdk:11-jre-slim as release

COPY --from=base /usr/src/target/serverless-cloud-0.0.1-SNAPSHOT.jar ./serverless-cloud.jar

EXPOSE 8080

CMD ["java", "-jar", "./serverless-cloud.jar"]