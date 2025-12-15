import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "2 solid #e5e7eb",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  businessContact: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 120,
    fontSize: 10,
    color: "#6b7280",
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    color: "#1f2937",
  },
  problemBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 4,
    border: "1 solid #e5e7eb",
  },
  problemText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 10,
    fontWeight: "bold",
    fontSize: 10,
    color: "#374151",
    borderBottom: "1 solid #d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottom: "1 solid #e5e7eb",
  },
  tableCol1: { width: "50%", paddingRight: 8 },
  tableCol2: { width: "15%", textAlign: "right" },
  tableCol3: { width: "20%", textAlign: "right" },
  tableCol4: { width: "15%", textAlign: "right", fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f9fafb",
    marginTop: 10,
    borderRadius: 4,
  },
  totalLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
    paddingRight: 20,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
    width: "15%",
    textAlign: "right",
  },
  notesBox: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 4,
    border: "1 solid #bfdbfe",
  },
  notesText: {
    fontSize: 10,
    color: "#1e40af",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: "1 solid #e5e7eb",
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 10,
  },
});

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuotePDFProps {
  quote: {
    id: string;
    total: number;
    createdAt: Date;
    validUntil?: Date | null;
    notes?: string | null;
    lineItems: LineItem[];
  };
  business: {
    name: string;
    phone: string;
    address?: string | null;
    logoUrl?: string | null;
  };
  request: {
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    problemDesc: string;
  };
}

export function QuotePDF({ quote, business, request }: QuotePDFProps) {
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString("en-MU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {business.logoUrl && (
              <Image src={business.logoUrl} style={styles.logo} />
            )}
            <View>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessContact}>{business.phone}</Text>
              {business.address && (
                <Text style={styles.businessContact}>{business.address}</Text>
              )}
            </View>
          </View>
          <View>
            <Text style={styles.businessContact}>Quote #</Text>
            <Text style={{ fontSize: 12, color: "#1f2937" }}>
              {quote.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Service Quote</Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text>Date: {formatDate(quote.createdAt)}</Text>
          {quote.validUntil && (
            <Text>Valid Until: {formatDate(quote.validUntil)}</Text>
          )}
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{request.clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{request.clientPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Location:</Text>
            <Text style={styles.infoValue}>{request.clientAddress}</Text>
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Required</Text>
          <View style={styles.problemBox}>
            <Text style={styles.problemText}>{request.problemDesc}</Text>
          </View>
        </View>

        {/* Quote Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Breakdown</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Description</Text>
              <Text style={styles.tableCol2}>Qty</Text>
              <Text style={styles.tableCol3}>Unit Price</Text>
              <Text style={styles.tableCol4}>Total</Text>
            </View>

            {/* Table Rows */}
            {quote.lineItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{item.description}</Text>
                <Text style={styles.tableCol2}>{item.quantity}</Text>
                <Text style={styles.tableCol3}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.tableCol4}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{quote.notes}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This quote is valid until{" "}
            {quote.validUntil
              ? formatDate(quote.validUntil)
              : "further notice"}
          </Text>
          <Text style={{ marginTop: 5 }}>
            Generated by FlowQuote - {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
