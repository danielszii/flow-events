import { controllers } from './config/composition-root';
import { agendadorExpiracaoInscricoes } from './config/modules/inscricao-module';
import { ApiExpress } from './infra/web/express/ApiExpress';
import { createRoutes } from './infra/web/express/routes';

function main() {
    agendadorExpiracaoInscricoes.iniciar();
    const router = createRoutes(controllers);
    const app = new ApiExpress(router);
    app.start(3000);
}

main();
