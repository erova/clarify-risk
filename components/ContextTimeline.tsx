import type { ContextEntry } from "@/types";
import { Separator } from "@/components/ui/separator";

interface Props {
  entries: ContextEntry[];
}

export function ContextTimeline({ entries }: Props) {
  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <div key={entry.id}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {entry.updated_by_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{entry.updated_by_name}</span>
                <span className="text-sm text-gray-500">v{entry.version}</span>
                <span className="text-sm text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">What was built</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{entry.what_was_built}</p>
                </div>

                {entry.decisions_made && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Decisions made</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{entry.decisions_made}</p>
                  </div>
                )}

                {entry.known_issues && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Known issues</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{entry.known_issues}</p>
                  </div>
                )}

                {entry.next_steps && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Next steps</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{entry.next_steps}</p>
                  </div>
                )}

                {entry.ai_handoff_notes && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">AI handoff notes</p>
                    <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md font-mono text-xs">
                      {entry.ai_handoff_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {index < entries.length - 1 && <Separator className="mt-6" />}
        </div>
      ))}
    </div>
  );
}
