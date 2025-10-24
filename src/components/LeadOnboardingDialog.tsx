import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Check, Mail, Phone, User, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  contactName: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
    .max(20, "Phone number must be less than 20 characters"),
  postalCode: z.string()
    .trim()
    .min(1, "Postcode is required")
    .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, "Please enter a valid UK postcode")
    .max(10, "Postcode must be less than 10 characters"),
});

interface LeadOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadOnboardingDialog = ({ open, onOpenChange }: LeadOnboardingDialogProps) => {
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    supportType: "companionship",
    visitFrequency: "twice-daily",
    careDuration: "long-term",
    priority: "flexibility",
    postalCode: "",
    contactName: "",
    email: "",
    phone: "",
  });

  const handleNext = () => {
    if (step < 8) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Validate form
    const result = contactSchema.safeParse({
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      postalCode: formData.postalCode,
    });

    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get current user (if logged in) or submit as anonymous
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("leads").insert({
        support_type: formData.supportType,
        visit_frequency: formData.visitFrequency,
        care_duration: formData.careDuration,
        priority: formData.priority,
        postal_code: formData.postalCode,
        contact_name: result.data.contactName,
        contact_email: result.data.email,
        contact_phone: result.data.phone,
        created_by: user?.id || null,
      });

      if (error) throw error;

      // Show success screen
      setStep(8);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      supportType: "companionship",
      visitFrequency: "twice-daily",
      careDuration: "long-term",
      priority: "flexibility",
      postalCode: "",
      contactName: "",
      email: "",
      phone: "",
    });
    onOpenChange(false);
  };

  const renderProgressIndicator = () => {
    const steps = [1, 2, 3, 4, 5];
    return (
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4 px-2">
        {steps.map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-semibold text-[10px] sm:text-xs ${
                step >= s
                  ? "bg-[#3DD9E8] text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {s < 10 ? `0${s}` : s}
            </div>
            {s < 5 && (
              <div className={`w-2 sm:w-6 h-0.5 border-t-2 border-dashed ${
                step > s ? "border-[#3DD9E8]" : "border-gray-300"
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden p-0 w-[95vw] sm:w-full" aria-describedby="lead-dialog-description">
        <div className="sr-only" id="lead-dialog-description">
          Complete this form to get matched with the best home care services for your needs
        </div>
        <DialogClose 
          className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-50"
          onClick={handleClose}
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Header with progress indicator - fixed height */}
        {step <= 5 && (
          <div className="flex-shrink-0 px-3 sm:px-6 pt-10 sm:pt-12 pb-2 sm:pb-3">
            {renderProgressIndicator()}
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-3 sm:px-6 min-h-0">

          {/* Step 1: Support Type */}
          {step === 1 && (
            <div className="space-y-2 sm:space-y-3 py-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-[#0B1D41] leading-tight px-2">
                What type of support do you need from a live-in carer?
              </h2>
              <RadioGroup
                value={formData.supportType}
                onValueChange={(value) => setFormData({ ...formData, supportType: value })}
                className="space-y-1.5 sm:space-y-2"
              >
                <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.supportType === "mobility" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
                }`}>
                  <RadioGroupItem value="mobility" id="mobility" />
                  <Label htmlFor="mobility" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                    Mobility and physical support
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.supportType === "companionship" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
                }`}>
                  <RadioGroupItem value="companionship" id="companionship" />
                  <Label htmlFor="companionship" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                    Companionship and social support
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.supportType === "meal" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
                }`}>
                  <RadioGroupItem value="meal" id="meal" />
                  <Label htmlFor="meal" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                    Meal preparation and household tasks
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.supportType === "medication" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
                }`}>
                  <RadioGroupItem value="medication" id="medication" />
                  <Label htmlFor="medication" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                    Medication reminders and health monitoring
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

        {/* Step 2: Visit Frequency */}
        {step === 2 && (
          <div className="space-y-2 sm:space-y-3 py-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-[#0B1D41] leading-tight px-2">
              How often would you like a home carer to visit?
            </h2>
            <RadioGroup
              value={formData.visitFrequency}
              onValueChange={(value) => setFormData({ ...formData, visitFrequency: value })}
              className="space-y-1.5 sm:space-y-2"
            >
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.visitFrequency === "once-daily" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="once-daily" id="once-daily" />
                <Label htmlFor="once-daily" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Once a day
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.visitFrequency === "twice-daily" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="twice-daily" id="twice-daily" />
                <Label htmlFor="twice-daily" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Twice a day
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.visitFrequency === "overnight" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="overnight" id="overnight" />
                <Label htmlFor="overnight" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Overnight stays
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.visitFrequency === "few-times" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="few-times" id="few-times" />
                <Label htmlFor="few-times" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  A few times a week
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Care Duration */}
        {step === 3 && (
          <div className="space-y-2 sm:space-y-3 py-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-[#0B1D41] leading-tight px-2">
              How long do you require live-in care?
            </h2>
            <RadioGroup
              value={formData.careDuration}
              onValueChange={(value) => setFormData({ ...formData, careDuration: value })}
              className="space-y-1.5 sm:space-y-2"
            >
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.careDuration === "short-term" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="short-term" id="short-term" />
                <Label htmlFor="short-term" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Short-term (respite or recovery care)
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.careDuration === "long-term" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="long-term" id="long-term" />
                <Label htmlFor="long-term" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Long-term continuous support
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.careDuration === "emergency" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Emergency / Immediate start
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.careDuration === "unsure" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="unsure" id="unsure" />
                <Label htmlFor="unsure" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Not sure yet, need advice
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 4: Priority */}
        {step === 4 && (
          <div className="space-y-2 sm:space-y-3 py-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-[#0B1D41] leading-tight px-2">
              What is most important to you in choosing a home care service?
            </h2>
            <RadioGroup
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
              className="space-y-1.5 sm:space-y-2"
            >
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.priority === "compassion" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="compassion" id="compassion" />
                <Label htmlFor="compassion" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Compassionate and friendly carers
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.priority === "flexibility" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="flexibility" id="flexibility" />
                <Label htmlFor="flexibility" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Flexible scheduling and reliability
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.priority === "expertise" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="expertise" id="expertise" />
                <Label htmlFor="expertise" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Specialist expertise
                </Label>
              </div>
              <div className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.priority === "affordability" ? "bg-[#E0F7FA] border-[#3DD9E8]" : "border-gray-200"
              }`}>
                <RadioGroupItem value="affordability" id="affordability" />
                <Label htmlFor="affordability" className="flex-1 cursor-pointer text-xs sm:text-sm leading-tight">
                  Affordability and clear pricing
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 5: Postal Code */}
        {step === 5 && (
          <div className="space-y-2 sm:space-y-3 py-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-[#0B1D41] leading-tight px-2">
              Good! We're almost there. Tell us the Postcode to attach to this
            </h2>
            <div className="flex justify-center px-2">
              <Input
                type="text"
                placeholder="Enter Postcode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })}
                className="py-2.5 sm:py-3 text-xs sm:text-sm text-center w-full sm:w-[70%]"
                required
              />
            </div>
          </div>
        )}

        {/* Step 6: Success Message */}
        {step === 6 && (
          <div className="space-y-4 py-4 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#3DD9E8] flex items-center justify-center">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1D41] mb-2 sm:mb-4">
                Great! We've found the best<br />matches for you
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Now, we just need your details to complete your request.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2 pb-4">
              <Button
                onClick={handleNext}
                className="w-full py-4 sm:py-6 text-sm sm:text-base bg-[#ED1B7B] hover:bg-[#ED1B7B]/90 text-white"
              >
                Continue
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full py-4 sm:py-6 text-sm sm:text-base"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Contact Form */}
        {step === 7 && (
          <div className="space-y-4 pb-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1D41] mb-2">
                What email or number would you<br />like the quote to be sent to?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Please provide the email address or phone number where<br />
                you'd like us to send your personalised care quote.
              </p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Contact Name"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="pl-12 py-4 sm:py-5 text-sm sm:text-base"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 py-4 sm:py-5 text-sm sm:text-base"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-12 py-4 sm:py-5 text-sm sm:text-base"
                />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full py-4 sm:py-5 text-sm sm:text-base bg-[#ED1B7B] hover:bg-[#ED1B7B]/90 text-white"
            >
              Submit Request
            </Button>
          </div>
        )}

        {/* Step 8: Final Success */}
        {step === 8 && (
          <div className="space-y-4 py-4 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="text-5xl sm:text-6xl">📧</div>
                <div className="absolute -top-2 -right-2 text-xl sm:text-2xl">🎉</div>
                <div className="absolute -bottom-2 -left-2 text-xl sm:text-2xl">💗</div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1D41] mb-2 sm:mb-4">
                Congratulations, the quote has been<br />sent to your email and number.
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                We've successfully sent your personalised care quote to<br />
                your email and phone number.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full py-4 sm:py-5 text-sm sm:text-base bg-[#ED1B7B] hover:bg-[#ED1B7B]/90 text-white"
            >
              Back to Home
            </Button>
          </div>
        )}
        </div>

        {/* Fixed Footer with Navigation Buttons (Steps 1-5) */}
        {step >= 1 && step <= 5 && (
          <div className="flex-shrink-0 border-t bg-background px-3 sm:px-6 py-2.5 sm:py-3">
            <div className="flex gap-2 sm:gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-20 sm:w-28 py-2 sm:py-2.5 text-xs sm:text-sm"
                disabled={step === 1 || isSearching}
              >
                Back
              </Button>
              <Button
                onClick={async () => {
                  if (step === 5) {
                    const postcodeValidation = z.string()
                      .trim()
                      .min(1, "Postcode is required")
                      .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, "Please enter a valid UK postcode")
                      .safeParse(formData.postalCode);
                    
                    if (!postcodeValidation.success) {
                      toast({
                        title: "Invalid Postcode",
                        description: postcodeValidation.error.errors[0].message,
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    // Show searching animation
                    setIsSearching(true);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setIsSearching(false);
                  }
                  handleNext();
                }}
                className="w-20 sm:w-28 py-2 sm:py-2.5 text-xs sm:text-sm bg-[#ED1B7B] hover:bg-[#ED1B7B]/90 text-white"
                disabled={isSearching}
              >
                {isSearching && step === 5 ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadOnboardingDialog;
