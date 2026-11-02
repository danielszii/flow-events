export type EventoProps = {
    id: string,
    titulo: string,
    descricao: string,
    data_hora_inicio: string,
    data_hora_fim: string,
    limite_ingressos_cpf: string,
    estado: string,
    criado_em: string
}


export class Evento {

    private constructor(
        private props: EventoProps,
    ) {
    }

    public static create(titulo: string, descricao: string, data_hora_inicio: string, data_hora_fim: string, limite_ingressos_cpf: string, estado: string, criado_em: string): Evento {
        return new Evento({ id: crypto.randomUUID().toString(), titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf, estado, criado_em })
    }
}