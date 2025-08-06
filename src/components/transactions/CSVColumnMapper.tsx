'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactionStore } from '@/stores/transactionStore';
import { CSVColumnMapping, CSVImportSession, TRANSACTION_CATEGORIES } from '@/types/transactions';

interface CSVColumnMapperProps {
  sessionId: string;
  onMappingComplete: (mapping: CSVColumnMapping) => void;
  onBack: () => void;
}

interface ColumnSuggestion {
  column: string;
  confidence: number;
  reason: string;
}

const REQUIRED_FIELDS = ['date', 'amount', 'description'] as const;
const OPTIONAL_FIELDS = ['category', 'merchant', 'paymentMethod'] as const;

const FIELD_DESCRIPTIONS = {
  date: 'Transaction date (e.g., 2024-01-15, 01/15/2024)',
  amount: 'Transaction amount (negative for expenses, positive for income)',
  description: 'Transaction description or memo',
  category: 'Transaction category (e.g., Food & Dining, Transportation)',
  merchant: 'Merchant or business name',
  paymentMethod: 'Payment method (e.g., Credit Card, Cash, Debit Card)'
};

export default function CSVColumnMapper({ sessionId, onMappingComplete, onBack }: CSVColumnMapperProps) {
  const { getCSVImportSession, updateCSVImportSession } = useTransactionStore();
  const [session, setSession] = useState<CSVImportSession | null>(null);
  const [mapping, setMapping] = useState<CSVColumnMapping>({
    date: '',
    amount: '',
    description: '',
    category: '',
    merchant: '',
    paymentMethod: ''
  });
  const [suggestions, setSuggestions] = useState<Record<string, ColumnSuggestion[]>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const importSession = getCSVImportSession(sessionId);
    if (importSession) {
      setSession(importSession);
      
      // Generate automatic suggestions
      const csvHeaders = importSession.previewData[0]?.data ? Object.keys(importSession.previewData[0].data) : [];
      const autoSuggestions = generateMappingSuggestions(csvHeaders);
      setSuggestions(autoSuggestions);

      // Apply auto-mapping for high-confidence suggestions
      const autoMapping: Partial<CSVColumnMapping> = {};
      Object.entries(autoSuggestions).forEach(([field, suggestions]) => {
        const bestSuggestion = suggestions[0];
        if (bestSuggestion && bestSuggestion.confidence > 0.8) {
          (autoMapping as Record<string, string>)[field] = bestSuggestion.column;
        }
      });

      setMapping(prev => ({ ...prev, ...autoMapping }));
    }
  }, [sessionId, getCSVImportSession]);

  const generateMappingSuggestions = (headers: string[]): Record<string, ColumnSuggestion[]> => {
    const suggestions: Record<string, ColumnSuggestion[]> = {};

    const fieldPatterns: Record<string, RegExp[]> = {
      date: [
        /^date$/i,
        /^transaction[_\s]?date$/i,
        /^posted[_\s]?date$/i,
        /^created[_\s]?at$/i,
        /^timestamp$/i
      ],
      amount: [
        /^amount$/i,
        /^transaction[_\s]?amount$/i,
        /^debit$/i,
        /^credit$/i,
        /^value$/i,
        /^price$/i
      ],
      description: [
        /^description$/i,
        /^memo$/i,
        /^note$/i,
        /^details$/i,
        /^transaction[_\s]?description$/i,
        /^reference$/i
      ],
      category: [
        /^category$/i,
        /^type$/i,
        /^classification$/i,
        /^group$/i
      ],
      merchant: [
        /^merchant$/i,
        /^vendor$/i,
        /^payee$/i,
        /^business$/i,
        /^store$/i,
        /^company$/i
      ],
      paymentMethod: [
        /^payment[_\s]?method$/i,
        /^card[_\s]?type$/i,
        /^account[_\s]?type$/i,
        /^method$/i
      ]
    };

    Object.entries(fieldPatterns).forEach(([field, patterns]) => {
      const fieldSuggestions: ColumnSuggestion[] = [];

      headers.forEach(header => {
        patterns.forEach((pattern, index) => {
          if (pattern.test(header)) {
            const confidence = 1 - (index * 0.1); // Higher confidence for earlier patterns
            fieldSuggestions.push({
              column: header,
              confidence,
              reason: `Matches pattern for ${field} field`
            });
          }
        });
      });

      // Sort by confidence
      fieldSuggestions.sort((a, b) => b.confidence - a.confidence);
      suggestions[field] = fieldSuggestions.slice(0, 3); // Top 3 suggestions
    });

    return suggestions;
  };

  const validateMapping = (): string[] => {
    const validationErrors: string[] = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!mapping[field]) {
        validationErrors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} field is required`);
      }
    });

    // Check for duplicate mappings
    const usedColumns = Object.values(mapping).filter(Boolean);
    const duplicates = usedColumns.filter((column, index) => usedColumns.indexOf(column) !== index);
    if (duplicates.length > 0) {
      validationErrors.push(`Duplicate column mappings: ${duplicates.join(', ')}`);
    }

    // Validate data samples if available
    if (session?.previewData) {
      const sampleRow = session.previewData[0]?.data;
      if (sampleRow) {
        // Check date format
        if (mapping.date && sampleRow[mapping.date]) {
          const dateValue = sampleRow[mapping.date];
          if (!isValidDate(dateValue)) {
            validationErrors.push(`Date column "${mapping.date}" contains invalid date format: "${dateValue}"`);
          }
        }

        // Check amount format
        if (mapping.amount && sampleRow[mapping.amount]) {
          const amountValue = sampleRow[mapping.amount];
          if (!isValidAmount(amountValue)) {
            validationErrors.push(`Amount column "${mapping.amount}" contains invalid amount format: "${amountValue}"`);
          }
        }
      }
    }

    return validationErrors;
  };

  const isValidDate = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  };

  const isValidAmount = (value: string): boolean => {
    const cleaned = value.replace(/[,$\s]/g, '');
    return !isNaN(parseFloat(cleaned));
  };

  const handleFieldMapping = (field: keyof CSVColumnMapping, column: string) => {
    setMapping(prev => ({ ...prev, [field]: column }));
    setErrors([]);
  };

  const handleAutoMap = () => {
    const autoMapping: Partial<CSVColumnMapping> = {};
    Object.entries(suggestions).forEach(([field, fieldSuggestions]) => {
      const bestSuggestion = fieldSuggestions[0];
      if (bestSuggestion) {
        (autoMapping as Record<string, string>)[field] = bestSuggestion.column;
      }
    });
    setMapping(prev => ({ ...prev, ...autoMapping }));
  };

  const handleConfirmMapping = () => {
    const validationErrors = validateMapping();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Update session with mapping
    updateCSVImportSession(sessionId, { mapping });
    onMappingComplete(mapping);
  };

  const resetMapping = () => {
    setMapping({
      date: '',
      amount: '',
      description: '',
      category: '',
      merchant: '',
      paymentMethod: ''
    });
    setErrors([]);
  };

  if (!session) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Loading import session...</p>
        </CardContent>
      </Card>
    );
  }

  const csvHeaders = session.previewData[0]?.data ? Object.keys(session.previewData[0].data) : [];
  const isMappingValid = REQUIRED_FIELDS.every(field => mapping[field]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Map CSV Columns
        </CardTitle>
        <p className="text-sm text-gray-600">
          Map your CSV columns to transaction fields. Required fields are marked with an asterisk (*).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Info */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{session.filename}</h4>
              <p className="text-sm text-gray-500">
                {session.totalRows} rows • {csvHeaders.length} columns
              </p>
            </div>
            <Badge variant="outline">CSV</Badge>
          </div>
        </div>

        {/* Auto-mapping controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={handleAutoMap} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Auto-map Columns
            </Button>
            <Button onClick={resetMapping} variant="outline" size="sm">
              Reset Mapping
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {Object.values(mapping).filter(Boolean).length} of {Object.keys(mapping).length} fields mapped
          </p>
        </div>

        {/* Mapping Interface */}
        <div className="grid gap-4">
          {(REQUIRED_FIELDS as readonly string[]).concat(OPTIONAL_FIELDS).map((field) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {REQUIRED_FIELDS.includes(field as typeof REQUIRED_FIELDS[number]) && (
                      <span className="text-red-500">*</span>
                    )}
                    {mapping[field as keyof CSVColumnMapping] && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {FIELD_DESCRIPTIONS[field as keyof typeof FIELD_DESCRIPTIONS]}
                  </p>
                </div>
              </div>

              {/* Column Selection */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {csvHeaders.map((header) => (
                    <Button
                      key={header}
                      variant={mapping[field as keyof CSVColumnMapping] === header ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFieldMapping(field as keyof CSVColumnMapping, header)}
                      className="text-xs"
                    >
                      {header}
                    </Button>
                  ))}
                </div>

                {/* Suggestions */}
                {suggestions[field] && suggestions[field].length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestions[field].map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-blue-100"
                          onClick={() => handleFieldMapping(field as keyof CSVColumnMapping, suggestion.column)}
                        >
                          {suggestion.column} ({Math.round(suggestion.confidence * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current mapping display */}
                {mapping[field as keyof CSVColumnMapping] && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                    <span className="text-sm font-medium">{field}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-sm">{mapping[field as keyof CSVColumnMapping]}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Preview */}
        {session.previewData.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Preview with Current Mapping</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.entries(mapping)
                      .filter(([_, column]) => column)
                      .map(([field, column]) => (
                        <th key={field} className="text-left p-2 font-medium">
                          {field} ({column})
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {session.previewData.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {Object.entries(mapping)
                        .filter(([_, column]) => column)
                        .map(([field, column]) => (
                          <td key={field} className="p-2 text-gray-600">
                            {row.data[column] || '-'}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back to Upload
          </Button>
          <Button 
            onClick={handleConfirmMapping}
            disabled={!isMappingValid}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Process Import
            {!isMappingValid && (
              <Badge variant="destructive" className="ml-2">
                {REQUIRED_FIELDS.filter(field => !mapping[field]).length} required
              </Badge>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
