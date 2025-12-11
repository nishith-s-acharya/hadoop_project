import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CriticalAlertRequest {
  threatId: string;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { threatId, recipientEmail }: CriticalAlertRequest = await req.json();
    console.log(`Processing critical alert for threat ${threatId} to ${recipientEmail}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch threat details
    const { data: threat, error: threatError } = await supabase
      .from("threat_logs")
      .select("*")
      .eq("id", threatId)
      .single();

    if (threatError || !threat) {
      console.error("Failed to fetch threat:", threatError);
      throw new Error("Threat not found");
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "SENTINEL <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `🚨 CRITICAL THREAT ALERT: ${threat.threat_type}`,
      html: `
        <div style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #00ff00; padding: 30px; border: 2px solid #00ff00;">
          <h1 style="color: #ff0000; border-bottom: 1px solid #ff0000; padding-bottom: 10px;">
            ⚠️ CRITICAL SECURITY ALERT
          </h1>
          
          <div style="margin: 20px 0; padding: 20px; background: #111; border-left: 4px solid #ff0000;">
            <h2 style="color: #ff6b6b; margin: 0 0 15px 0;">Threat Details</h2>
            <table style="width: 100%; color: #00ff00;">
              <tr>
                <td style="padding: 8px 0; color: #888;">Threat Type:</td>
                <td style="padding: 8px 0;"><strong>${threat.threat_type}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Severity:</td>
                <td style="padding: 8px 0;"><span style="color: #ff0000; font-weight: bold;">${threat.severity.toUpperCase()}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Source IP:</td>
                <td style="padding: 8px 0;">${threat.source_ip}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Location:</td>
                <td style="padding: 8px 0;">${threat.location || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Timestamp:</td>
                <td style="padding: 8px 0;">${new Date(threat.timestamp).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Protocol:</td>
                <td style="padding: 8px 0;">${threat.protocol || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Port:</td>
                <td style="padding: 8px 0;">${threat.port || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background: #1a1a1a; border-radius: 4px;">
            <h3 style="color: #ff9800; margin: 0 0 10px 0;">Description</h3>
            <p style="margin: 0; line-height: 1.6;">${threat.description}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666;">
            <p>This is an automated alert from SENTINEL Threat Intelligence Platform.</p>
            <p>Alert ID: ${threat.id}</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the notification
    const { error: logError } = await supabase.from("alert_notifications").insert({
      threat_log_id: threatId,
      notification_type: "email",
      recipient: recipientEmail,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("Failed to log notification:", logError);
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-critical-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
