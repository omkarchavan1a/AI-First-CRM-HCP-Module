export interface HCP {
  id: string;
  name: string;
  specialty: string;
  institution: string;
  email: string;
  phone: string;
}

export interface SampleDistributed {
  product: string;
  quantity: number;
}

export interface InteractionData {
  hcpName: string;
  hcpSpecialty: string;
  detailingTopic: string;
  productsDiscussed: string[];
  samplesDistributed: SampleDistributed[];
  nextSteps: string;
  followUpDate: string;
  feedbackSentiment: 'Positive' | 'Neutral' | 'Critical' | '';
  complianceVerified: boolean;
}

export interface Interaction extends InteractionData {
  id: string;
  hcpId?: string;
  date: string;
  timestamp: string;
  loggedByChat: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  activeNode?: string;
  thought?: string;
}

export interface AgentThought {
  node: string;
  thought: string;
  timestamp: string;
}

export interface CRMState {
  hcps: HCP[];
  interactions: Interaction[];
  loadingHcps: boolean;
  loadingInteractions: boolean;
  activeTab: 'chat' | 'form';
  currentLog: InteractionData;
  activeLangGraphNode: 'GREETING' | 'DETAILING' | 'SAMPLES' | 'NEXT_STEPS' | 'COMPLETED';
  agentChatHistory: ChatMessage[];
  agentLoading: boolean;
  agentThoughts: AgentThought[];
  error: string | null;
}
