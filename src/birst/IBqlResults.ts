export interface IBqlResults {
	columnFormats: string[];
	columnNames: string[];
	displayNames: string[];
	warehouseColumnDataTypes: string[];
	reportColumns?: any;
	drillPaths: any[][];
	hasMoreRows: boolean;
	dataTypes: string[];
	expires: number;
	rows: any[][];
}