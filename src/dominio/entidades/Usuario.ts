export type UsuarioProps = {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  criado_em: string;
}

export class Usuario {

  private constructor(
    private props: UsuarioProps
  ) {
  }

  public static create(cpf: string, nome: string, email: string): Usuario {
    if (!cpf || !cpf.trim()) {
      throw new Error('CPF é obrigatório');
    }
    if (!nome || !nome.trim()) {
      throw new Error('Nome é obrigatório');
    }
    if (!email || !email.trim()) {
      throw new Error('Email é obrigatório');
    }

    return new Usuario({
      id: crypto.randomUUID().toString(),
      cpf,
      nome,
      email,
      criado_em: new Date().toISOString(),
    });
  }

  public static fromPersistence(props: UsuarioProps): Usuario {
    return new Usuario(props);
  }

  public toPersistence(): UsuarioProps {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
  }

  public get cpf() {
    return this.props.cpf;
  }

  public get nome() {
    return this.props.nome;
  }

  public get email() {
    return this.props.email;
  }

  public get criado_em() {
    return this.props.criado_em;
  }

  public alterarNome(novoNome: string): void {
    if (!novoNome.trim()) throw new Error('Nome inválido');
    this.props.nome = novoNome;
  }

  public alterarEmail(novoEmail: string): void {
    if (!novoEmail.trim()) throw new Error('Email inválido');
    this.props.email = novoEmail;
  }
}