import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';

export const TermsModal: React.FC = () => {
  const { setMustAcceptTerms } = useAuthStore();
  const [accepted, setAccepted]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      await authService.acceptTerms();
      setMustAcceptTerms(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Termos de Uso e Política de Privacidade</h2>
            <p className="text-xs text-gray-400">AlmoxPert — Sistema de Gestão do Almoxarifado · IFBA</p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 space-y-5 flex-1">

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">1. Sobre o sistema</h3>
            <p className="leading-relaxed text-gray-600">
              O <strong>AlmoxPert</strong> é um sistema de gestão do almoxarifado do Instituto Federal de Educação,
              Ciência e Tecnologia da Bahia (IFBA), destinado ao controle de solicitações, distribuição e movimentação
              de materiais escolares e de assistência estudantil.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">2. Dados pessoais coletados</h3>
            <p className="leading-relaxed text-gray-600 mb-2">
              Para a operação do sistema, coletamos e armazenamos os seguintes dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
              <li>Nome completo e endereço de e-mail institucional</li>
              <li>Número de matrícula e curso (para estudantes)</li>
              <li>Campus, nível de ensino e modalidade</li>
              <li>Forma de ingresso (SISU, Processo Seletivo, etc.)</li>
              <li>Programas sociais e bolsas/auxílios recebidos</li>
              <li>Pontuação de barema e tipo de refeição (quando aplicável)</li>
              <li>Histórico de pedidos de materiais realizados no sistema</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">3. Finalidade do tratamento de dados</h3>
            <p className="leading-relaxed text-gray-600">
              Os dados coletados são utilizados exclusivamente para: (i) autenticação e controle de acesso ao sistema;
              (ii) processamento e acompanhamento de pedidos de materiais; (iii) comunicações relacionadas ao uso do
              sistema, como confirmação de pedidos, redefinição de senha e notificações administrativas;
              (iv) geração de relatórios internos de gestão do almoxarifado pelo IFBA.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">4. Base legal (LGPD)</h3>
            <p className="leading-relaxed text-gray-600">
              O tratamento dos dados se fundamenta no art. 7.º, inciso II e V da Lei n.º 13.709/2018 (LGPD):
              cumprimento de obrigação legal e execução de políticas públicas de assistência estudantil pelo IFBA,
              bem como execução de contrato ou de procedimentos preliminares relacionados à prestação de serviços
              institucionais ao titular.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">5. Envio de e-mails</h3>
            <p className="leading-relaxed text-gray-600">
              O sistema poderá enviar e-mails automáticos para: boas-vindas e credenciais de acesso inicial;
              códigos de redefinição de senha; atualização de status de solicitações de pedidos.
              Você pode desativar o recebimento de e-mails a qualquer momento na página de perfil, exceto
              e-mails de segurança (redefinição de senha), que são essenciais ao funcionamento do sistema.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">6. Segurança e confidencialidade</h3>
            <p className="leading-relaxed text-gray-600">
              Senhas são armazenadas exclusivamente como hash criptográfico (bcrypt) — nunca em texto puro.
              O acesso ao sistema é protegido por autenticação JWT com expiração. Os dados são armazenados em
              banco de dados com acesso restrito à equipe técnica do IFBA e não são compartilhados com terceiros
              para fins comerciais.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">7. Retenção de dados</h3>
            <p className="leading-relaxed text-gray-600">
              Os dados pessoais são mantidos durante o período de vínculo do estudante com o IFBA e,
              posteriormente, pelo prazo mínimo exigido pela legislação aplicável (Lei de Arquivos e normativas
              do MEC), após o qual serão eliminados ou anonimizados.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">8. Seus direitos (LGPD, art. 18)</h3>
            <p className="leading-relaxed text-gray-600 mb-2">
              Como titular dos dados, você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
              <li>Confirmar a existência de tratamento e acessar seus dados</li>
              <li>Solicitar correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a eliminação de dados desnecessários ou tratados em desconformidade</li>
              <li>Revogar o consentimento para envio de e-mails opcionais</li>
              <li>Obter informações sobre o compartilhamento de seus dados</li>
            </ul>
            <p className="leading-relaxed text-gray-600 mt-2">
              Para exercer esses direitos, entre em contato com a administração do almoxarifado do IFBA.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">9. Atualizações desta política</h3>
            <p className="leading-relaxed text-gray-600">
              Esta política pode ser atualizada periodicamente. Em caso de alterações relevantes, o sistema
              solicitará nova confirmação de aceite.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              Li e concordo com os <strong className="text-gray-800">Termos de Uso</strong> e a{' '}
              <strong className="text-gray-800">Política de Privacidade</strong> do AlmoxPert, incluindo o
              tratamento dos meus dados pessoais conforme descrito acima, em conformidade com a LGPD
              (Lei n.º 13.709/2018).
            </span>
          </label>

          <Button
            onClick={handleAccept}
            disabled={!accepted}
            loading={loading}
            className="w-full"
          >
            Aceitar e continuar
          </Button>
        </div>

      </div>
    </div>
  );
};
