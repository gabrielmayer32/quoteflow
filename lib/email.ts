import { Resend } from "resend";
import type { RequestStatus } from "@prisma/client";

type BusinessSummary = {
  name: string;
  email: string;
};

type RequestSummary = {
  id: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  clientAddress: string;
  problemDesc: string;
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  QUOTED: "Quoted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
};

const STATUS_DESCRIPTIONS: Partial<Record<RequestStatus, string>> = {
  NEW: "We've received your request and the team has been notified.",
  REVIEWING: "A technician is reviewing the information you provided.",
  QUOTED: "Your quote is ready to review and approve.",
  APPROVED: "Thanks! We've recorded your approval and will follow up shortly.",
  REJECTED: "The quote was rejected. Feel free to reply if you have questions.",
  SCHEDULED: "Your service has been scheduled. We'll send the details separately.",
  COMPLETED: "Your request has been marked as completed. Thank you!",
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const resendReplyTo = process.env.RESEND_REPLY_TO;

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function isEmailConfigured() {
  return Boolean(resendClient && resendFromEmail);
}

async function sendEmailMessage({
  to,
  subject,
  html,
}: {
  to: string | (string | null | undefined)[];
  subject: string;
  html: string;
}) {
  if (!isEmailConfigured()) {
    console.warn("Email skipped: Resend is not configured");
    return;
  }

  const recipients = (Array.isArray(to) ? to : [to]).filter(
    (entry): entry is string => Boolean(entry)
  );

  if (recipients.length === 0) return;

  try {
    await resendClient!.emails.send({
      from: resendFromEmail!,
      to: recipients,
      subject,
      html,
      replyTo: resendReplyTo || undefined,
    });
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
  }
}

export async function sendNewRequestNotifications({
  business,
  request,
}: {
  business: BusinessSummary;
  request: RequestSummary;
}) {
  const safeBusinessName = escapeHtml(business.name);
  const safeClientName = escapeHtml(request.clientName);
  const safeClientEmail = request.clientEmail ? escapeHtml(request.clientEmail) : null;
  const safeClientPhone = escapeHtml(request.clientPhone);
  const safeClientAddress = escapeHtml(request.clientAddress);
  const safeProblemDesc = escapeHtml(request.problemDesc).replace(/\n/g, "<br />");

  const requestUrl = `${getBaseUrl()}/requests/${request.id}`;
  const businessHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">New service request received</h2>
      <p style="margin: 0 0 16px;">${safeClientName} just submitted a new request.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="margin:0;"><strong>Client:</strong> ${safeClientName}</p>
        <p style="margin:0;"><strong>Email:</strong> ${safeClientEmail || "—"}</p>
        <p style="margin:0;"><strong>Phone:</strong> ${safeClientPhone}</p>
        <p style="margin:0;"><strong>Address:</strong> ${safeClientAddress}</p>
      </div>
      <p style="margin-bottom:8px;"><strong>Problem description</strong></p>
      <p style="background:#f1f5f9;border-radius:8px;padding:12px;margin-top:0;">
        ${safeProblemDesc}
      </p>
      <p style="margin-top:24px;">
        <a href="${requestUrl}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;">Open in dashboard</a>
      </p>
    </div>
  `;

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">Thanks, ${safeClientName}!</h2>
      <p style="margin: 0 0 16px;">We received your request and ${safeBusinessName} will follow up shortly.</p>
      <p style="margin:0 0 4px;"><strong>What happens next?</strong></p>
      <ol style="margin:0 0 16px 20px;padding:0;">
        <li>We review the details you provided</li>
        <li>We prepare a quote</li>
        <li>You receive updates by email or phone</li>
      </ol>
      <p style="margin:0;">If anything changes, just reply to this email.</p>
    </div>
  `;

  await Promise.all([
    sendEmailMessage({
      to: business.email,
      subject: `New request from ${request.clientName}`,
      html: businessHtml,
    }),
    sendEmailMessage({
      to: request.clientEmail || undefined,
      subject: `${business.name} received your request`,
      html: clientHtml,
    }),
  ]);
}

export async function sendClientStatusUpdateEmail({
  business,
  request,
  newStatus,
  quoteApprovalToken,
}: {
  business: BusinessSummary;
  request: RequestSummary;
  newStatus: RequestStatus;
  quoteApprovalToken?: string;
}) {
  if (!request.clientEmail) return;

  const statusLabel = STATUS_LABELS[newStatus];
  const statusDescription =
    STATUS_DESCRIPTIONS[newStatus] ||
    "Your request has been updated. Reply if you have any questions.";

  const safeBusinessName = escapeHtml(business.name);
  const safeStatusLabel = escapeHtml(statusLabel);
  const safeStatusDescription = escapeHtml(statusDescription);
  const safeClientPhone = escapeHtml(request.clientPhone);

  const details: string[] = [
    `<strong>Status:</strong> ${safeStatusLabel}`,
    `<strong>Business:</strong> ${safeBusinessName}`,
    `<strong>Phone:</strong> ${safeClientPhone}`,
  ];

  const approvalUrl =
    quoteApprovalToken && newStatus === "QUOTED"
      ? `${getBaseUrl()}/approve/${quoteApprovalToken}`
      : undefined;

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">Your request status has changed</h2>
      <p style="margin:0 0 12px;">${safeStatusDescription}</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        ${details.map((line) => `<p style="margin:0;">${line}</p>`).join("")}
      </div>
      ${
        approvalUrl
          ? `<p style="margin-top:0;margin-bottom:16px;">Your detailed quote is available here:</p>
      <p style="margin:0;">
        <a href="${approvalUrl}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;">
          View & approve quote
        </a>
      </p>`
          : ""
      }
      <p style="margin-top:24px;">Need to talk to us? Just reply to this email.</p>
    </div>
  `;

  await sendEmailMessage({
    to: request.clientEmail,
    subject: `${business.name} updated your request (${statusLabel})`,
    html: clientHtml,
  });
}
