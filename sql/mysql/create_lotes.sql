-- Requer eventos.id como VARCHAR(36) e a tabela eventos usando InnoDB.
CREATE TABLE IF NOT EXISTS lotes (
  id VARCHAR(36) NOT NULL,
  evento_id VARCHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(12, 2) NOT NULL,
  quantidade_total INT UNSIGNED NOT NULL,
  data_hora_inicio_venda DATETIME(3) NOT NULL,
  data_hora_fim_venda DATETIME(3) NOT NULL,
  criado_em DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_lotes_evento_venda (evento_id, data_hora_inicio_venda, criado_em),
  CONSTRAINT fk_lotes_eventos
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
