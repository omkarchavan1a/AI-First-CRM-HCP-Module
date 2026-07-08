import { Calendar, User, MessageSquareCode, FileText, CheckCircle, BrainCircuit } from "lucide-react";
import { useAppSelector } from "../store";

export default function HistoryLogs() {
  const { interactions, loadingInteractions } = useAppSelector((state) => state.crm);

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Neutral":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "Critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  if (loadingInteractions) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <span className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full mb-3" />
        <span className="text-xs text-slate-500 font-medium">Fetching secure PostgreSQL records...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">PostgreSQL Audit Database</h3>
          <p className="text-[10px] text-slate-500">
            Regulatory record of active medical-rep details and compliant starter distributions
          </p>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          Total Logs: {interactions.length}
        </div>
      </div>

      {interactions.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">No interaction logs committed yet</p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[280px]">
            Log a new call using the AI Copilot Chat or Structured Form to seed the PostgreSQL audit store.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                <th className="px-6 py-3">Logged Date</th>
                <th className="px-6 py-3">HCP Practitioner</th>
                <th className="px-6 py-3">Detailing Topic</th>
                <th className="px-6 py-3">Products Discussed</th>
                <th className="px-6 py-3">Samples Logged</th>
                <th className="px-6 py-3">Sentiment</th>
                <th className="px-6 py-3 text-right">Log Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interactions.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors text-xs text-slate-700">
                  {/* Logged Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5 font-mono text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{log.date || (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "04/19/2025")}</span>
                      </div>
                      {log.time && (
                        <span className="text-[10px] text-slate-400 pl-5">{log.time}</span>
                      )}
                    </div>
                  </td>

                  {/* HCP Practitioner */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{log.hcpName}</span>
                      <span className="text-[10px] text-slate-400">{log.hcpSpecialty}</span>
                    </div>
                  </td>

                  {/* Detailing Topic */}
                  <td className="px-6 py-4">
                    <p className="line-clamp-2 max-w-[220px] text-slate-600 leading-relaxed" title={log.detailingTopic}>
                      {log.detailingTopic}
                    </p>
                  </td>

                  {/* Products Discussed */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {log.productsDiscussed.length > 0 ? (
                        log.productsDiscussed.map((prod) => (
                          <span key={prod} className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-100 text-teal-700 text-[9px] font-semibold">
                            {prod}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">None</span>
                      )}
                    </div>
                  </td>

                  {/* Samples Distributed */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      {log.samplesDistributed.length > 0 ? (
                        log.samplesDistributed.map((item, idx) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-600">
                            {item.product}: <span className="font-mono text-slate-900 font-semibold">{item.quantity}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">None</span>
                      )}
                      {log.complianceVerified && (
                        <span className="text-[8px] font-bold text-emerald-600 uppercase mt-1 flex items-center gap-0.5">
                          <CheckCircle className="h-2.5 w-2.5" /> PDMA Signature OK
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Sentiment */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.feedbackSentiment ? (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getSentimentBadge(log.feedbackSentiment)}`}>
                        {log.feedbackSentiment}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">Not logged</span>
                    )}
                  </td>

                  {/* Log Channel */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {log.loggedByChat ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-teal-500/10 text-teal-700 border border-teal-500/15 px-2 py-0.5 rounded-md font-medium">
                          <BrainCircuit className="h-3 w-3" /> Conversational
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                          <FileText className="h-3 w-3" /> Structured
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
