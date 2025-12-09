FROM eclipse-temurin:17-jdk-focal AS build
WORKDIR /app
COPY . /app
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar /app/app.jar --server.port=${PORT:-8080}"]
