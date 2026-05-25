package com.bioimpedance.util;

import org.springframework.stereotype.Component;

/**
 * Interpreta o percentual de gordura corporal e classifica o IMC.
 * Baseado nos mesmos critérios usados no frontend (interpretation.ts).
 */
@Component
public class BodyFatInterpreter {

    /**
     * Retorna a classificação do percentual de gordura.
     * Limiares diferentes para masculino e feminino.
     */
    public String interpretBodyFat(String gender, double bodyFat) {
        if (bodyFat <= 0) return "Sem dados";

        if ("MALE".equalsIgnoreCase(gender)) {
            if (bodyFat < 10) return "Muito baixo";
            if (bodyFat < 15) return "Atleta";
            if (bodyFat < 20) return "Normal";
            if (bodyFat < 25) return "Alto";
            return "Muito alto";
        } else {
            if (bodyFat < 18) return "Muito baixo";
            if (bodyFat < 23) return "Atleta";
            if (bodyFat < 30) return "Normal";
            if (bodyFat < 35) return "Alto";
            return "Muito alto";
        }
    }

    /**
     * Classifica o IMC segundo critérios da OMS.
     */
    public String classifyIMC(double imc) {
        if (imc < 18.5) return "Abaixo do peso";
        if (imc < 25.0) return "Peso normal";
        if (imc < 30.0) return "Sobrepeso";
        if (imc < 35.0) return "Obesidade grau I";
        if (imc < 40.0) return "Obesidade grau II";
        return "Obesidade grau III";
    }
}