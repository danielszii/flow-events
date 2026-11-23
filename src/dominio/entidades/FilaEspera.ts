import { FilaEsperaInvalidaError } from "../erros/FilaEsperaInvalidaError";

export type FilaEsperaProps = {
  id: string;
  usuario_id: string;
  evento_id: string;
  lote_id: string;
  criado_em: string;
}

export class FilaEspera {
  private constructor(private props: FilaEsperaProps) {}

  public static create(
    usuario_id: string,
    evento_id: string,
    lote_id: string,
    criadoEm: Date = new Date(),
  ): FilaEspera {
    if (!usuario_id || !usuario_id.trim()) {
      throw new FilaEsperaInvalidaError("ID do usuário é obrigatório");
    }
    if (!evento_id || !evento_id.trim()) {
      throw new FilaEsperaInvalidaError("ID do evento é obrigatório");
    }
    if (!lote_id || !lote_id.trim()) {
      throw new FilaEsperaInvalidaError("ID do lote é obrigatório");
    }
    if (Number.isNaN(criadoEm.getTime())) {
      throw new FilaEsperaInvalidaError("Data de entrada na fila inválida");
    }

    return new FilaEspera({
      id: crypto.randomUUID(),
      usuario_id: usuario_id.trim(),
      evento_id: evento_id.trim(),
      lote_id: lote_id.trim(),
      criado_em: criadoEm.toISOString(),
    });
  }

  public static fromPersistence(props: FilaEsperaProps): FilaEspera {
    return new FilaEspera({ ...props });
  }

  public toPersistence(): FilaEsperaProps {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
  }

  public get usuario_id() {
    return this.props.usuario_id;
  }

  public get evento_id() {
    return this.props.evento_id;
  }

  public get lote_id() {
    return this.props.lote_id;
  }

  public get criado_em() {
    return this.props.criado_em;
  }
}
