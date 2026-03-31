export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          engagement_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          org_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          engagement_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          org_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          engagement_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_artifacts: {
        Row: {
          approved_by: string | null
          artifact_type: Database["public"]["Enums"]["artifact_type"]
          content: string | null
          created_at: string
          engagement_id: string
          execution_id: string
          format: Database["public"]["Enums"]["artifact_format"]
          id: string
          name: string
          org_id: string
          status: Database["public"]["Enums"]["artifact_status"]
          storage_path: string | null
          version: number | null
        }
        Insert: {
          approved_by?: string | null
          artifact_type: Database["public"]["Enums"]["artifact_type"]
          content?: string | null
          created_at?: string
          engagement_id: string
          execution_id: string
          format?: Database["public"]["Enums"]["artifact_format"]
          id?: string
          name: string
          org_id: string
          status?: Database["public"]["Enums"]["artifact_status"]
          storage_path?: string | null
          version?: number | null
        }
        Update: {
          approved_by?: string | null
          artifact_type?: Database["public"]["Enums"]["artifact_type"]
          content?: string | null
          created_at?: string
          engagement_id?: string
          execution_id?: string
          format?: Database["public"]["Enums"]["artifact_format"]
          id?: string
          name?: string
          org_id?: string
          status?: Database["public"]["Enums"]["artifact_status"]
          storage_path?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_artifacts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_artifacts_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_artifacts_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "agent_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_artifacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_definitions: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          description: string | null
          execution_mode: Database["public"]["Enums"]["agent_execution_mode"]
          id: string
          input_schema: Json | null
          is_active: boolean | null
          is_system: boolean | null
          name: string
          output_schema: Json | null
          system_prompt: string
          version: number | null
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          description?: string | null
          execution_mode?: Database["public"]["Enums"]["agent_execution_mode"]
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          output_schema?: Json | null
          system_prompt: string
          version?: number | null
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          description?: string | null
          execution_mode?: Database["public"]["Enums"]["agent_execution_mode"]
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          output_schema?: Json | null
          system_prompt?: string
          version?: number | null
        }
        Relationships: []
      }
      agent_executions: {
        Row: {
          agent_id: string
          cost_cents: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          execution_step: number | null
          id: string
          input_tokens: number | null
          model_used: string | null
          org_id: string
          output_artifacts: Json | null
          output_content: string | null
          output_tokens: number | null
          status: string | null
          step_description: string | null
          task_id: string
        }
        Insert: {
          agent_id: string
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_step?: number | null
          id?: string
          input_tokens?: number | null
          model_used?: string | null
          org_id: string
          output_artifacts?: Json | null
          output_content?: string | null
          output_tokens?: number | null
          status?: string | null
          step_description?: string | null
          task_id: string
        }
        Update: {
          agent_id?: string
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_step?: number | null
          id?: string
          input_tokens?: number | null
          model_used?: string | null
          org_id?: string
          output_artifacts?: Json | null
          output_content?: string | null
          output_tokens?: number | null
          status?: string | null
          step_description?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_executions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          engagement_id: string
          id: string
          input_data: Json | null
          org_id: string
          priority: Database["public"]["Enums"]["agent_task_priority"]
          scheduled_for: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["agent_task_status"]
          trigger_context: Json | null
          triggered_by: string | null
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          engagement_id: string
          id?: string
          input_data?: Json | null
          org_id: string
          priority?: Database["public"]["Enums"]["agent_task_priority"]
          scheduled_for?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_task_status"]
          trigger_context?: Json | null
          triggered_by?: string | null
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          engagement_id?: string
          id?: string
          input_data?: Json | null
          org_id?: string
          priority?: Database["public"]["Enums"]["agent_task_priority"]
          scheduled_for?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_task_status"]
          trigger_context?: Json | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json | null
          action_type: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          trigger_config: Json | null
          trigger_type: string
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          trigger_config?: Json | null
          trigger_type: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          trigger_config?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_type: Database["public"]["Enums"]["checklist_type"]
          due_date: string | null
          engagement_id: string
          id: string
          notes: string | null
          org_id: string
          owner: string | null
          phase: string | null
          sign_off: Database["public"]["Enums"]["sign_off_status"]
          sort_order: number | null
          status: Database["public"]["Enums"]["task_status"]
          task: string
        }
        Insert: {
          checklist_type: Database["public"]["Enums"]["checklist_type"]
          due_date?: string | null
          engagement_id: string
          id?: string
          notes?: string | null
          org_id: string
          owner?: string | null
          phase?: string | null
          sign_off?: Database["public"]["Enums"]["sign_off_status"]
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          task: string
        }
        Update: {
          checklist_type?: Database["public"]["Enums"]["checklist_type"]
          due_date?: string | null
          engagement_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          owner?: string | null
          phase?: string | null
          sign_off?: Database["public"]["Enums"]["sign_off_status"]
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          task?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_updates: {
        Row: {
          approved_by: string | null
          content: string
          created_at: string
          engagement_id: string
          generated_by: string | null
          id: string
          opened_by: Json | null
          org_id: string
          recipients: Json | null
          sent_at: string | null
          status: Database["public"]["Enums"]["client_update_status"]
          update_type: Database["public"]["Enums"]["client_update_type"]
        }
        Insert: {
          approved_by?: string | null
          content: string
          created_at?: string
          engagement_id: string
          generated_by?: string | null
          id?: string
          opened_by?: Json | null
          org_id: string
          recipients?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["client_update_status"]
          update_type: Database["public"]["Enums"]["client_update_type"]
        }
        Update: {
          approved_by?: string | null
          content?: string
          created_at?: string
          engagement_id?: string
          generated_by?: string | null
          id?: string
          opened_by?: Json | null
          org_id?: string
          recipients?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["client_update_status"]
          update_type?: Database["public"]["Enums"]["client_update_type"]
        }
        Relationships: [
          {
            foreignKeyName: "client_updates_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_updates_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_updates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          action: Database["public"]["Enums"]["compliance_action"]
          condition: Json
          created_by: string | null
          id: string
          is_active: boolean | null
          org_id: string
          rule_name: string
          rule_type: string
          severity: Database["public"]["Enums"]["compliance_severity"]
        }
        Insert: {
          action?: Database["public"]["Enums"]["compliance_action"]
          condition: Json
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          rule_name: string
          rule_type: string
          severity?: Database["public"]["Enums"]["compliance_severity"]
        }
        Update: {
          action?: Database["public"]["Enums"]["compliance_action"]
          condition?: Json
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          rule_name?: string
          rule_type?: string
          severity?: Database["public"]["Enums"]["compliance_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "compliance_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_violations: {
        Row: {
          created_at: string
          engagement_id: string | null
          id: string
          member_id: string | null
          org_id: string
          resolved_at: string | null
          resolved_by: string | null
          rule_id: string
          status: Database["public"]["Enums"]["violation_status"]
          violation_detail: Json
        }
        Insert: {
          created_at?: string
          engagement_id?: string | null
          id?: string
          member_id?: string | null
          org_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id: string
          status?: Database["public"]["Enums"]["violation_status"]
          violation_detail: Json
        }
        Update: {
          created_at?: string
          engagement_id?: string | null
          id?: string
          member_id?: string | null
          org_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string
          status?: Database["public"]["Enums"]["violation_status"]
          violation_detail?: Json
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          context: string | null
          date: string | null
          decision: string
          engagement_id: string
          id: string
          impact: Database["public"]["Enums"]["impact_level"]
          made_by: string | null
          org_id: string
          reversible: boolean | null
          status: Database["public"]["Enums"]["decision_status"]
        }
        Insert: {
          context?: string | null
          date?: string | null
          decision: string
          engagement_id: string
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"]
          made_by?: string | null
          org_id: string
          reversible?: boolean | null
          status?: Database["public"]["Enums"]["decision_status"]
        }
        Update: {
          context?: string | null
          date?: string | null
          decision?: string
          engagement_id?: string
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"]
          made_by?: string | null
          org_id?: string
          reversible?: boolean | null
          status?: Database["public"]["Enums"]["decision_status"]
        }
        Relationships: [
          {
            foreignKeyName: "decisions_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_signals: {
        Row: {
          current_value: number | null
          data_points: Json | null
          deviation: number | null
          engagement_id: string
          expected_value: number | null
          id: string
          measured_at: string
          org_id: string
          signal_category: string
          trend: Database["public"]["Enums"]["signal_trend"]
        }
        Insert: {
          current_value?: number | null
          data_points?: Json | null
          deviation?: number | null
          engagement_id: string
          expected_value?: number | null
          id?: string
          measured_at?: string
          org_id: string
          signal_category: string
          trend?: Database["public"]["Enums"]["signal_trend"]
        }
        Update: {
          current_value?: number | null
          data_points?: Json | null
          deviation?: number | null
          engagement_id?: string
          expected_value?: number | null
          id?: string
          measured_at?: string
          org_id?: string
          signal_category?: string
          trend?: Database["public"]["Enums"]["signal_trend"]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_signals_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_signals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          actual_go_live: string | null
          created_at: string
          customer_name: string | null
          description: string | null
          health: Database["public"]["Enums"]["health_status"]
          health_score: number | null
          id: string
          name: string
          org_id: string
          owner_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["engagement_status"]
          tags: string[] | null
          target_go_live: string | null
          updated_at: string
        }
        Insert: {
          actual_go_live?: string | null
          created_at?: string
          customer_name?: string | null
          description?: string | null
          health?: Database["public"]["Enums"]["health_status"]
          health_score?: number | null
          id?: string
          name: string
          org_id: string
          owner_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["engagement_status"]
          tags?: string[] | null
          target_go_live?: string | null
          updated_at?: string
        }
        Update: {
          actual_go_live?: string | null
          created_at?: string
          customer_name?: string | null
          description?: string | null
          health?: Database["public"]["Enums"]["health_status"]
          health_score?: number | null
          id?: string
          name?: string
          org_id?: string
          owner_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["engagement_status"]
          tags?: string[] | null
          target_go_live?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
        ]
      }
      error_patterns: {
        Row: {
          auto_resolution: string | null
          error_signature: string
          error_type: string
          id: string
          last_occurrence: string | null
          occurrence_count: number | null
          requires_human: boolean | null
          resolution_success_rate: number | null
        }
        Insert: {
          auto_resolution?: string | null
          error_signature: string
          error_type: string
          id?: string
          last_occurrence?: string | null
          occurrence_count?: number | null
          requires_human?: boolean | null
          resolution_success_rate?: number | null
        }
        Update: {
          auto_resolution?: string | null
          error_signature?: string
          error_type?: string
          id?: string
          last_occurrence?: string | null
          occurrence_count?: number | null
          requires_human?: boolean | null
          resolution_success_rate?: number | null
        }
        Relationships: []
      }
      financial_tracking: {
        Row: {
          billing_model: Database["public"]["Enums"]["billing_model"]
          budget_consumed: number | null
          budget_total: number | null
          currency: string | null
          engagement_id: string
          id: string
          last_calculated: string | null
          margin_actual: number | null
          margin_target: number | null
          org_id: string
          revenue_recognized: number | null
        }
        Insert: {
          billing_model?: Database["public"]["Enums"]["billing_model"]
          budget_consumed?: number | null
          budget_total?: number | null
          currency?: string | null
          engagement_id: string
          id?: string
          last_calculated?: string | null
          margin_actual?: number | null
          margin_target?: number | null
          org_id: string
          revenue_recognized?: number | null
        }
        Update: {
          billing_model?: Database["public"]["Enums"]["billing_model"]
          budget_consumed?: number | null
          budget_total?: number | null
          currency?: string | null
          engagement_id?: string
          id?: string
          last_calculated?: string | null
          margin_actual?: number | null
          margin_target?: number | null
          org_id?: string
          revenue_recognized?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_tracking_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_tracking_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_feedback: {
        Row: {
          agent_id: string
          created_at: string
          execution_id: string
          feedback_by: string
          feedback_notes: string | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id: string
          modified_output: string | null
          org_id: string
          original_output: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          execution_id: string
          feedback_by: string
          feedback_notes?: string | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id?: string
          modified_output?: string | null
          org_id: string
          original_output?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          execution_id?: string
          feedback_by?: string
          feedback_notes?: string | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          modified_output?: string | null
          org_id?: string
          original_output?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_feedback_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_feedback_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "agent_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_feedback_feedback_by_fkey"
            columns: ["feedback_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_feedback_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons_learned: {
        Row: {
          category: Database["public"]["Enums"]["lesson_category"]
          created_at: string
          engagement_id: string
          finding: string
          id: string
          impact: Database["public"]["Enums"]["impact_level"]
          org_id: string
          owner: string | null
          recommendation: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["lesson_category"]
          created_at?: string
          engagement_id: string
          finding: string
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"]
          org_id: string
          owner?: string | null
          recommendation?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["lesson_category"]
          created_at?: string
          engagement_id?: string
          finding?: string
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"]
          org_id?: string
          owner?: string | null
          recommendation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_learned_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_learned_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_learning_context: {
        Row: {
          confidence: number | null
          context_key: string
          context_type: Database["public"]["Enums"]["learning_context_type"]
          context_value: string
          id: string
          last_updated: string
          org_id: string
          source_count: number | null
        }
        Insert: {
          confidence?: number | null
          context_key: string
          context_type: Database["public"]["Enums"]["learning_context_type"]
          context_value: string
          id?: string
          last_updated?: string
          org_id: string
          source_count?: number | null
        }
        Update: {
          confidence?: number | null
          context_key?: string
          context_type?: Database["public"]["Enums"]["learning_context_type"]
          context_value?: string
          id?: string
          last_updated?: string
          org_id?: string
          source_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "org_learning_context_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["org_plan"]
          settings: Json | null
          slug: string
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["org_plan"]
          settings?: Json | null
          slug: string
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["org_plan"]
          settings?: Json | null
          slug?: string
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      outcome_correlations: {
        Row: {
          action_taken: string | null
          correlation_data: Json | null
          created_at: string
          engagement_id: string | null
          id: string
          org_id: string
          outcome: Database["public"]["Enums"]["outcome_result"]
          signal_type: string
        }
        Insert: {
          action_taken?: string | null
          correlation_data?: Json | null
          created_at?: string
          engagement_id?: string | null
          id?: string
          org_id: string
          outcome: Database["public"]["Enums"]["outcome_result"]
          signal_type: string
        }
        Update: {
          action_taken?: string | null
          correlation_data?: Json | null
          created_at?: string
          engagement_id?: string | null
          id?: string
          org_id?: string
          outcome?: Database["public"]["Enums"]["outcome_result"]
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_correlations_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_correlations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assumptions: string[] | null
          constraints: string[] | null
          created_at: string
          engagement_id: string
          generated_by: string | null
          id: string
          milestones: Json | null
          org_id: string
          phases: Json | null
          source_document: string | null
          status: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assumptions?: string[] | null
          constraints?: string[] | null
          created_at?: string
          engagement_id: string
          generated_by?: string | null
          id?: string
          milestones?: Json | null
          org_id: string
          phases?: Json | null
          source_document?: string | null
          status?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assumptions?: string[] | null
          constraints?: string[] | null
          created_at?: string
          engagement_id?: string
          generated_by?: string | null
          id?: string
          milestones?: Json | null
          org_id?: string
          phases?: Json | null
          source_document?: string | null
          status?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_plans_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_plans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      raci_items: {
        Row: {
          accountable: string | null
          consulted: string | null
          deliverable: string
          engagement_id: string
          id: string
          informed: string | null
          org_id: string
          responsible: string | null
          sort_order: number | null
        }
        Insert: {
          accountable?: string | null
          consulted?: string | null
          deliverable: string
          engagement_id: string
          id?: string
          informed?: string | null
          org_id: string
          responsible?: string | null
          sort_order?: number | null
        }
        Update: {
          accountable?: string | null
          consulted?: string | null
          deliverable?: string
          engagement_id?: string
          id?: string
          informed?: string | null
          org_id?: string
          responsible?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raci_items_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raci_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_allocations: {
        Row: {
          allocated_hours_per_week: number | null
          end_date: string | null
          engagement_id: string
          id: string
          member_id: string
          org_id: string
          role: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["allocation_status"]
        }
        Insert: {
          allocated_hours_per_week?: number | null
          end_date?: string | null
          engagement_id: string
          id?: string
          member_id: string
          org_id: string
          role?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["allocation_status"]
        }
        Update: {
          allocated_hours_per_week?: number | null
          end_date?: string | null
          engagement_id?: string
          id?: string
          member_id?: string
          org_id?: string
          role?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["allocation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_profiles: {
        Row: {
          available_hours_per_week: number | null
          billable_rate: number | null
          hourly_cost: number | null
          id: string
          max_concurrent_engagements: number | null
          member_id: string
          org_id: string
          skills: string[] | null
          timezone: string | null
        }
        Insert: {
          available_hours_per_week?: number | null
          billable_rate?: number | null
          hourly_cost?: number | null
          id?: string
          max_concurrent_engagements?: number | null
          member_id: string
          org_id: string
          skills?: string[] | null
          timezone?: string | null
        }
        Update: {
          available_hours_per_week?: number | null
          billable_rate?: number | null
          hourly_cost?: number | null
          id?: string
          max_concurrent_engagements?: number | null
          member_id?: string
          org_id?: string
          skills?: string[] | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_profiles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_signals: {
        Row: {
          acknowledged_by: string | null
          confidence: number | null
          description: string
          detected_at: string
          engagement_id: string
          evidence: Json | null
          id: string
          org_id: string
          outcome: Database["public"]["Enums"]["risk_outcome"] | null
          recommended_action: string | null
          resolution_notes: string | null
          severity: Database["public"]["Enums"]["risk_severity"]
          signal_type: string
          status: Database["public"]["Enums"]["risk_signal_status"]
        }
        Insert: {
          acknowledged_by?: string | null
          confidence?: number | null
          description: string
          detected_at?: string
          engagement_id: string
          evidence?: Json | null
          id?: string
          org_id: string
          outcome?: Database["public"]["Enums"]["risk_outcome"] | null
          recommended_action?: string | null
          resolution_notes?: string | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          signal_type: string
          status?: Database["public"]["Enums"]["risk_signal_status"]
        }
        Update: {
          acknowledged_by?: string | null
          confidence?: number | null
          description?: string
          detected_at?: string
          engagement_id?: string
          evidence?: Json | null
          id?: string
          org_id?: string
          outcome?: Database["public"]["Enums"]["risk_outcome"] | null
          recommended_action?: string | null
          resolution_notes?: string | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          signal_type?: string
          status?: Database["public"]["Enums"]["risk_signal_status"]
        }
        Relationships: [
          {
            foreignKeyName: "risk_signals_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_signals_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_signals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scope_items: {
        Row: {
          date_added: string | null
          date_resolved: string | null
          engagement_id: string
          id: string
          notes: string | null
          org_id: string
          priority: Database["public"]["Enums"]["moscow_priority"]
          requested_by: string | null
          requirement: string
          sort_order: number | null
          status: Database["public"]["Enums"]["scope_status"]
        }
        Insert: {
          date_added?: string | null
          date_resolved?: string | null
          engagement_id: string
          id?: string
          notes?: string | null
          org_id: string
          priority?: Database["public"]["Enums"]["moscow_priority"]
          requested_by?: string | null
          requirement: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["scope_status"]
        }
        Update: {
          date_added?: string | null
          date_resolved?: string | null
          engagement_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          priority?: Database["public"]["Enums"]["moscow_priority"]
          requested_by?: string | null
          requirement?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["scope_status"]
        }
        Relationships: [
          {
            foreignKeyName: "scope_items_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      self_healing_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["healing_event_type"]
          healing_action: string
          id: string
          metadata: Json | null
          org_id: string | null
          related_task_id: string | null
          result: Database["public"]["Enums"]["healing_result"]
          trigger_error: string
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["healing_event_type"]
          healing_action: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          related_task_id?: string | null
          result: Database["public"]["Enums"]["healing_result"]
          trigger_error: string
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["healing_event_type"]
          healing_action?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          related_task_id?: string | null
          result?: Database["public"]["Enums"]["healing_result"]
          trigger_error?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_healing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "self_healing_events_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          communication_pref: Database["public"]["Enums"]["communication_pref"]
          email: string | null
          engagement_id: string
          id: string
          influence: Database["public"]["Enums"]["influence_level"]
          key_concerns: string | null
          last_contact: string | null
          name: string
          org_id: string
          organization: string | null
          role: string | null
        }
        Insert: {
          communication_pref?: Database["public"]["Enums"]["communication_pref"]
          email?: string | null
          engagement_id: string
          id?: string
          influence?: Database["public"]["Enums"]["influence_level"]
          key_concerns?: string | null
          last_contact?: string | null
          name: string
          org_id: string
          organization?: string | null
          role?: string | null
        }
        Update: {
          communication_pref?: Database["public"]["Enums"]["communication_pref"]
          email?: string | null
          engagement_id?: string
          id?: string
          influence?: Database["public"]["Enums"]["influence_level"]
          key_concerns?: string | null
          last_contact?: string | null
          name?: string
          org_id?: string
          organization?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      status_reports: {
        Row: {
          accomplished: Json | null
          blockers: Json | null
          created_at: string
          engagement_id: string
          generated_by: string | null
          id: string
          org_id: string
          overall_health: Database["public"]["Enums"]["health_status"]
          pdf_url: string | null
          period_end: string
          period_start: string
          planned_next: Json | null
          report_type: Database["public"]["Enums"]["report_type"]
          risks: Json | null
        }
        Insert: {
          accomplished?: Json | null
          blockers?: Json | null
          created_at?: string
          engagement_id: string
          generated_by?: string | null
          id?: string
          org_id: string
          overall_health?: Database["public"]["Enums"]["health_status"]
          pdf_url?: string | null
          period_end: string
          period_start: string
          planned_next?: Json | null
          report_type?: Database["public"]["Enums"]["report_type"]
          risks?: Json | null
        }
        Update: {
          accomplished?: Json | null
          blockers?: Json | null
          created_at?: string
          engagement_id?: string
          generated_by?: string | null
          id?: string
          org_id?: string
          overall_health?: Database["public"]["Enums"]["health_status"]
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          planned_next?: Json | null
          report_type?: Database["public"]["Enums"]["report_type"]
          risks?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "status_reports_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_checks: {
        Row: {
          check_type: Database["public"]["Enums"]["health_check_type"]
          checked_at: string
          id: string
          measured_value: number | null
          metadata: Json | null
          status: Database["public"]["Enums"]["system_health_status"]
          threshold_critical: number | null
          threshold_warn: number | null
        }
        Insert: {
          check_type: Database["public"]["Enums"]["health_check_type"]
          checked_at?: string
          id?: string
          measured_value?: number | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["system_health_status"]
          threshold_critical?: number | null
          threshold_warn?: number | null
        }
        Update: {
          check_type?: Database["public"]["Enums"]["health_check_type"]
          checked_at?: string
          id?: string
          measured_value?: number | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["system_health_status"]
          threshold_critical?: number | null
          threshold_warn?: number | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          agent_generated: boolean | null
          approved: boolean | null
          billable: boolean | null
          category: Database["public"]["Enums"]["time_category"]
          date: string
          description: string | null
          engagement_id: string
          hours: number
          id: string
          member_id: string
          org_id: string
        }
        Insert: {
          agent_generated?: boolean | null
          approved?: boolean | null
          billable?: boolean | null
          category?: Database["public"]["Enums"]["time_category"]
          date?: string
          description?: string | null
          engagement_id: string
          hours: number
          id?: string
          member_id: string
          org_id: string
        }
        Update: {
          agent_generated?: boolean | null
          approved?: boolean | null
          billable?: boolean | null
          category?: Database["public"]["Enums"]["time_category"]
          date?: string
          description?: string | null
          engagement_id?: string
          hours?: number
          id?: string
          member_id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_member: { Args: { check_org_id: string }; Returns: boolean }
    }
    Enums: {
      agent_execution_mode: "auto_execute" | "propose_and_wait" | "assist"
      agent_task_priority: "low" | "normal" | "high" | "urgent"
      agent_task_status:
        | "queued"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
        | "awaiting_approval"
      agent_type:
        | "documentation"
        | "testing"
        | "migration"
        | "configuration"
        | "communication"
        | "analysis"
      allocation_status: "active" | "planned" | "completed"
      artifact_format: "markdown" | "pdf" | "json" | "xlsx" | "docx"
      artifact_status: "draft" | "approved" | "delivered" | "archived"
      artifact_type:
        | "document"
        | "test_report"
        | "migration_log"
        | "config_file"
        | "status_report"
        | "project_plan"
      billing_model: "fixed_fee" | "time_and_materials" | "milestone"
      checklist_type: "kickoff" | "go_live"
      client_update_status: "draft" | "approved" | "sent" | "failed"
      client_update_type:
        | "weekly_status"
        | "milestone_reached"
        | "risk_alert"
        | "go_live_countdown"
      communication_pref: "email" | "slack" | "call" | "in_person"
      compliance_action: "warn" | "block" | "notify" | "auto_correct"
      compliance_severity: "info" | "warning" | "critical"
      decision_status: "active" | "superseded" | "reversed"
      engagement_status:
        | "kickoff"
        | "in_progress"
        | "uat"
        | "go_live"
        | "complete"
        | "on_hold"
      feedback_type: "accepted" | "modified" | "rejected"
      healing_event_type:
        | "auto_retry"
        | "circuit_break"
        | "fallback_activated"
        | "graceful_degradation"
        | "auto_rollback"
        | "anomaly_detected"
      healing_result: "resolved" | "escalated" | "failed"
      health_check_type:
        | "api_availability"
        | "db_performance"
        | "agent_success_rate"
        | "queue_depth"
        | "error_rate"
      health_status: "green" | "yellow" | "red"
      impact_level: "high" | "medium" | "low"
      influence_level: "high" | "medium" | "low"
      learning_context_type:
        | "writing_style"
        | "risk_patterns"
        | "common_issues"
        | "client_preferences"
        | "process_norms"
      lesson_category:
        | "process"
        | "communication"
        | "technical"
        | "scope"
        | "timeline"
      moscow_priority: "must" | "should" | "could" | "wont"
      org_plan: "free" | "pro" | "team" | "enterprise"
      org_role: "owner" | "admin" | "member" | "viewer"
      outcome_result: "positive" | "neutral" | "negative"
      report_type: "internal" | "customer" | "executive"
      risk_outcome: "risk_materialized" | "risk_avoided" | "false_alarm"
      risk_severity: "low" | "medium" | "high" | "critical"
      risk_signal_status:
        | "detected"
        | "acknowledged"
        | "mitigated"
        | "escalated"
        | "false_positive"
      scope_status: "approved" | "pending" | "rejected" | "deferred"
      sign_off_status: "pending" | "approved" | "na"
      signal_trend: "improving" | "stable" | "declining"
      system_health_status: "healthy" | "degraded" | "critical"
      task_status: "not_started" | "in_progress" | "complete" | "blocked" | "na"
      time_category: "delivery" | "admin" | "internal" | "training"
      violation_status: "open" | "acknowledged" | "resolved" | "waived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_execution_mode: ["auto_execute", "propose_and_wait", "assist"],
      agent_task_priority: ["low", "normal", "high", "urgent"],
      agent_task_status: [
        "queued",
        "running",
        "completed",
        "failed",
        "cancelled",
        "awaiting_approval",
      ],
      agent_type: [
        "documentation",
        "testing",
        "migration",
        "configuration",
        "communication",
        "analysis",
      ],
      allocation_status: ["active", "planned", "completed"],
      artifact_format: ["markdown", "pdf", "json", "xlsx", "docx"],
      artifact_status: ["draft", "approved", "delivered", "archived"],
      artifact_type: [
        "document",
        "test_report",
        "migration_log",
        "config_file",
        "status_report",
        "project_plan",
      ],
      billing_model: ["fixed_fee", "time_and_materials", "milestone"],
      checklist_type: ["kickoff", "go_live"],
      client_update_status: ["draft", "approved", "sent", "failed"],
      client_update_type: [
        "weekly_status",
        "milestone_reached",
        "risk_alert",
        "go_live_countdown",
      ],
      communication_pref: ["email", "slack", "call", "in_person"],
      compliance_action: ["warn", "block", "notify", "auto_correct"],
      compliance_severity: ["info", "warning", "critical"],
      decision_status: ["active", "superseded", "reversed"],
      engagement_status: [
        "kickoff",
        "in_progress",
        "uat",
        "go_live",
        "complete",
        "on_hold",
      ],
      feedback_type: ["accepted", "modified", "rejected"],
      healing_event_type: [
        "auto_retry",
        "circuit_break",
        "fallback_activated",
        "graceful_degradation",
        "auto_rollback",
        "anomaly_detected",
      ],
      healing_result: ["resolved", "escalated", "failed"],
      health_check_type: [
        "api_availability",
        "db_performance",
        "agent_success_rate",
        "queue_depth",
        "error_rate",
      ],
      health_status: ["green", "yellow", "red"],
      impact_level: ["high", "medium", "low"],
      influence_level: ["high", "medium", "low"],
      learning_context_type: [
        "writing_style",
        "risk_patterns",
        "common_issues",
        "client_preferences",
        "process_norms",
      ],
      lesson_category: [
        "process",
        "communication",
        "technical",
        "scope",
        "timeline",
      ],
      moscow_priority: ["must", "should", "could", "wont"],
      org_plan: ["free", "pro", "team", "enterprise"],
      org_role: ["owner", "admin", "member", "viewer"],
      outcome_result: ["positive", "neutral", "negative"],
      report_type: ["internal", "customer", "executive"],
      risk_outcome: ["risk_materialized", "risk_avoided", "false_alarm"],
      risk_severity: ["low", "medium", "high", "critical"],
      risk_signal_status: [
        "detected",
        "acknowledged",
        "mitigated",
        "escalated",
        "false_positive",
      ],
      scope_status: ["approved", "pending", "rejected", "deferred"],
      sign_off_status: ["pending", "approved", "na"],
      signal_trend: ["improving", "stable", "declining"],
      system_health_status: ["healthy", "degraded", "critical"],
      task_status: ["not_started", "in_progress", "complete", "blocked", "na"],
      time_category: ["delivery", "admin", "internal", "training"],
      violation_status: ["open", "acknowledged", "resolved", "waived"],
    },
  },
} as const
