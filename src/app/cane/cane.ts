export interface Cane {
}

// BasicAuth Interface
export interface BasicAuth {
	username: string,
	password: string
}

// SessionAuth Interface
export interface SessionAuth {
	username: string,
	password: string,
	authBody: string,
	authBodyMap: Array<object>, //[]map[string]string
	cookieLifetime: number
}

// APIKeyAuth Interface
export interface APIKeyAuth {
	header: string,
	key: string
}

// Rfc3447Auth Interface
export interface Rfc3447Auth {
	publicKey: string,
	privateKey: string //*rsa.PrivateKey
}

// API Interface
export interface API {
	name: string,
	deviceAccount: string,
	method: string,
	path: string,
	body: string,
	type: string
}

// UserAccount Interface
export interface  UserAccount {
	fame: string,
	lname: string,
	username: string,
	password: string,
	privilege: number,
	enable: boolean,
	token: string
}

// DeviceAccount Struct
export interface DeviceAccount {
	name: string,
	baseURL: string,
	authType: string,
	requireProxy: boolean,
	authObj: object //map[string]interface{}
}

// RouteValue Interface
export interface RouteValue {
	enable: boolean,
	verb: string,
	version: number,
	category: string,
	route: string,
	message: object //map[string]string
}

// Workflow Interface
export interface Workflow {
	name: string
	description: string
	type: string
	steps: Array<Step>
	// Note, add OutputMap []map[string]string
}

// WorkflowClaim Interface
export interface WorkflowClaim {
	timestamp: string,
	workflowResults: object, //map[string]StepResult
	claimCode: string,
	currentStatus: number
}

// Step Interface
export interface Step {
	title: string,
	description: string,
	apiCall: string,
	deviceAccount: string,
	varMap: Array<object> //[]map[string]string
}

// StepResult Interface
export interface StepResult {
	apiCall: string,
	apiAccount: string,
	reqBody: string,
	resBody: string,
	error: string,
	status: number
}

// WorkflowResult Interface
export interface workflowResult {
  apiAccount: string;
  apiCall: string;
  error: string;
  reqBody: string;
  resBody: string;
  status: number;
}

// Job Interface
export interface Job {
  claimCode: string;
  currentStatus: number;
  jobId: string;
  timestamp: string;
  results: workflowResult[];
}

// CANE User Interface
export interface CaneUser {
	fname: string;
	lname: string;
	username: string;
	token: string;
  }