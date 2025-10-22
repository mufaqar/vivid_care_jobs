import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, FileText, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: string;
  step_number: number;
  field_name: string;
  question_text: string;
  options: any;
  is_active: boolean;
  created_at: string;
}

const CMSPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { canManageCrud } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("onboarding_questions")
        .select("*")
        .order("step_number", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading questions",
        description: "Unable to fetch onboarding questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Build options object from individual fields
    const optionsArray = formData.getAll("option_value");
    const options: Record<string, string> = {};
    optionsArray.forEach((value, index) => {
      if (value) {
        options[`option${index + 1}`] = value as string;
      }
    });

    const questionData = {
      step_number: parseInt(formData.get("step_number") as string),
      field_name: formData.get("field_name") as string,
      question_text: formData.get("question_text") as string,
      options: options,
      is_active: formData.get("is_active") === "true",
    };

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from("onboarding_questions")
          .update(questionData)
          .eq("id", editingQuestion.id);

        if (error) throw error;
        toast({
          title: "Question updated",
          description: "The question has been successfully updated",
        });
      } else {
        const { error } = await supabase
          .from("onboarding_questions")
          .insert(questionData);

        if (error) throw error;
        toast({
          title: "Question created",
          description: "A new question has been added",
        });
      }

      setIsDialogOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving question",
        description: "Unable to save the question",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("onboarding_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Question deleted",
        description: "The question has been removed",
      });
      fetchQuestions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting question",
        description: "Unable to delete the question",
      });
    }
  };

  if (!canManageCrud) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage content.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage onboarding questions and form content
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingQuestion(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No questions configured yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Badge variant="outline">Step {question.step_number}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {question.field_name}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {question.question_text}
                      </TableCell>
                      <TableCell>
                        <Badge className={question.is_active ? "bg-green-500" : "bg-gray-500"}>
                          {question.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              Configure the onboarding form questions and options
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="step_number">Step Number</Label>
                <Input
                  id="step_number"
                  name="step_number"
                  type="number"
                  defaultValue={editingQuestion?.step_number}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_name">Field Name</Label>
                <Input
                  id="field_name"
                  name="field_name"
                  defaultValue={editingQuestion?.field_name}
                  placeholder="e.g., support_type"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Textarea
                id="question_text"
                name="question_text"
                defaultValue={editingQuestion?.question_text}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add multiple choice options for this question
              </p>
              {[1, 2, 3, 4, 5].map((num) => {
                const optionKey = `option${num}`;
                const defaultValue = editingQuestion?.options?.[optionKey] || "";
                return (
                  <div key={num} className="flex items-center gap-2">
                    <Label className="w-20">Option {num}</Label>
                    <Input
                      name="option_value"
                      placeholder={`Option ${num} text (leave empty if not needed)`}
                      defaultValue={defaultValue}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                value="true"
                defaultChecked={editingQuestion?.is_active ?? true}
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingQuestion(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Question</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CMSPage;
