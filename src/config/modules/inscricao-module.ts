import { ReservarInscricao } from "../../aplicacao/usecase/inscricao/ReservarInscricao";
import { CancelarInscricao } from "../../aplicacao/usecase/inscricao/CancelarInscricao";
import { ConfirmarInscricao } from "../../aplicacao/usecase/inscricao/ConfirmarInscricao";
import { ExpirarInscricoesPendentes } from "../../aplicacao/usecase/inscricao/ExpirarInscricoesPendentes";
import { PromoverFilaEspera } from "../../aplicacao/usecase/inscricao/PromoverFilaEspera";
import { EventoRepositorioMysql } from "../../infra/bd/mysql/EventoRepositorioMysql";
import { LoteRepositorioMysql } from "../../infra/bd/mysql/LoteRepositorioMysql";
import { UsuarioRepositorioMysql } from "../../infra/bd/mysql/UsuarioRepositorioMysql";
import { InscricaoRepositorioMemoria } from "../../infra/bd/memoria/InscricaoRepositorioMemoria";
import { FilaEsperaRepositorioMemoria } from "../../infra/bd/memoria/FilaEsperaRepositorioMemoria";
import { InscricaoControle } from "../../infra/web/express/controle/InscricaoControle";
import { AgendadorExpiracaoInscricoes } from "../../infra/worker/AgendadorExpiracaoInscricoes";

const usuarioRepositorio = new UsuarioRepositorioMysql();
const eventoRepositorio = new EventoRepositorioMysql();
const loteRepositorio = new LoteRepositorioMysql();
const inscricaoRepositorio = new InscricaoRepositorioMemoria(usuarioRepositorio);
const filaEsperaRepositorio = new FilaEsperaRepositorioMemoria();
const promoverFilaEspera = new PromoverFilaEspera(
  inscricaoRepositorio,
  filaEsperaRepositorio,
  loteRepositorio,
  usuarioRepositorio,
  eventoRepositorio,
);

const reservarInscricao = new ReservarInscricao(
  usuarioRepositorio,
  eventoRepositorio,
  loteRepositorio,
  inscricaoRepositorio,
  filaEsperaRepositorio,
  promoverFilaEspera,
);
export const confirmarInscricao = new ConfirmarInscricao(inscricaoRepositorio);
export const cancelarInscricao = new CancelarInscricao(inscricaoRepositorio, promoverFilaEspera);
export const expirarInscricoesPendentes = new ExpirarInscricoesPendentes(
  inscricaoRepositorio,
  promoverFilaEspera,
);
export const agendadorExpiracaoInscricoes = new AgendadorExpiracaoInscricoes(
  expirarInscricoesPendentes,
);

export const inscricaoControle = new InscricaoControle(reservarInscricao, cancelarInscricao);
