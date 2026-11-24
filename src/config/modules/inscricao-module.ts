import { ReservarInscricao } from "../../aplicacao/usecase/inscricao/ReservarInscricao";
import { CancelarInscricao } from "../../aplicacao/usecase/inscricao/CancelarInscricao";
import { ConfirmarInscricao } from "../../aplicacao/usecase/inscricao/ConfirmarInscricao";
import { ExpirarInscricoesPendentes } from "../../aplicacao/usecase/inscricao/ExpirarInscricoesPendentes";
import { PromoverFilaEspera } from "../../aplicacao/usecase/inscricao/PromoverFilaEspera";
import { EventoRepositorioPostgres } from "../../infra/bd/postgres/EventoRepositorioPostgres";
import { LoteRepositorioPostgres } from "../../infra/bd/postgres/LoteRepositorioPostgres";
import { UsuarioRepositorioPostgres } from "../../infra/bd/postgres/UsuarioRepositorioPostgres";
import { InscricaoRepositorioPostgres } from "../../infra/bd/postgres/InscricaoRepositorioPostgres";
import { FilaEsperaRepositorioPostgres } from "../../infra/bd/postgres/FilaEsperaRepositorioPostgres";
import { InscricaoControle } from "../../infra/web/express/controle/InscricaoControle";
import { AgendadorExpiracaoInscricoes } from "../../infra/worker/AgendadorExpiracaoInscricoes";

const usuarioRepositorio = new UsuarioRepositorioPostgres();
const eventoRepositorio = new EventoRepositorioPostgres();
const loteRepositorio = new LoteRepositorioPostgres();
const inscricaoRepositorio = new InscricaoRepositorioPostgres();
const filaEsperaRepositorio = new FilaEsperaRepositorioPostgres();

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
