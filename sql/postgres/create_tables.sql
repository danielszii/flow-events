-- Script DDL para PostgreSQL - Flow Events
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(36) PRIMARY KEY,
  cpf VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS eventos (
  id VARCHAR(36) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_hora_inicio TIMESTAMPTZ NOT NULL,
  data_hora_fim TIMESTAMPTZ NOT NULL,
  limite_ingressos_cpf INT NOT NULL,
  estado VARCHAR(50) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS lotes (
  id VARCHAR(36) PRIMARY KEY,
  evento_id VARCHAR(36) NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  preco NUMERIC(12, 2) NOT NULL,
  quantidade_total INT NOT NULL,
  data_hora_inicio_venda TIMESTAMPTZ NOT NULL,
  data_hora_fim_venda TIMESTAMPTZ NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS inscricoes (
  id VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id VARCHAR(36) NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  lote_id VARCHAR(36) NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  estado VARCHAR(50) NOT NULL,
  reservado_em TIMESTAMPTZ NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  confirmado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS fila_espera (
  id VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id VARCHAR(36) NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  lote_id VARCHAR(36) NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  estado VARCHAR(50) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lotes_evento ON lotes (evento_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_lote ON inscricoes (lote_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario ON inscricoes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_fila_espera_lote ON fila_espera (lote_id, criado_em);
