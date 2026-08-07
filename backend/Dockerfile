# syntax=docker/dockerfile:1

FROM node:24-alpine AS frontend-build
ARG VERSION=dev
ENV VITE_APP_VERSION=$VERSION
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src/backend
COPY ["backend/TennisStringTracker.Api.csproj", "./"]
RUN dotnet restore "TennisStringTracker.Api.csproj"
COPY backend/ .
RUN dotnet publish "TennisStringTracker.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY --from=frontend-build /src/frontend/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TennisStringTracker.Api.dll"]
