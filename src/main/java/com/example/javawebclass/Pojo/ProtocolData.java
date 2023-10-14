package com.example.javawebclass.Pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;

public class ProtocolData {
    public ProtocolData() {
    }

    public ProtocolData(String operation) {
        this.operation = operation;
    }

    public ProtocolData(String operation, JsonNode json) {
        this.protocol = "ws";
        this.operation = operation;
        this.result=json;
    }

    private String protocol;
    private String operation;
    private JsonNode result;

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getOperation() {
        return operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }

    public JsonNode getResult() {
        return result;
    }

    public void setResult(JsonNode result) {
        this.result = result;
    }
}
