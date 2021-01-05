dotnet version: 5.0.101

```
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
dotnet run "amqp://guest:guest@localhost:5672" "filateste" "oi" "tudobem"
dotnet run "amqp://guest:guest@localhost:5672" "filateste" 
```