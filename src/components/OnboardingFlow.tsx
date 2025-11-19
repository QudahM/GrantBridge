import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import countries from "world-countries";
import { useAuth } from "../contexts/AuthContext";
import { upsertUserProfile, UserProfileData } from "../lib/profile";
import { OnboardingSEO } from "./SEO";

interface OnboardingFlowProps {
  onComplete?: (userData: any) => void;
}

interface UserData {
  age: string;
  country: string;
  genderIdentity: string;
  citizenship: string;
  schoolStatus: string;
  degreeType: string;
  yearOfStudy: string;
  fieldOfStudy: string;
  gpa: string;
  incomeBracket: string;
  financialNeed: boolean;
  ethnicity: string;
  identifiers: string[];
}

const FormGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-2">{children}</div>
);

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete = () => {},
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const totalSteps = 6;
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState((1 / totalSteps) * 100);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    age: "",
    country: "",
    genderIdentity: "",
    citizenship: "",
    schoolStatus: "",
    degreeType: "",
    yearOfStudy: "",
    fieldOfStudy: "",
    gpa: "",
    incomeBracket: "",
    financialNeed: false,
    ethnicity: "",
    identifiers: [],
  });

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setProgress(((step + 1) / totalSteps) * 100);
    } else {
      setSaving(true);

      try {
        // Prepare profile data in the correct format for UserProfileData
        const finalUserProfile: UserProfileData = {
          age: userData.age || undefined,
          country: userData.country || undefined,
          genderIdentity: userData.genderIdentity || undefined,
          citizenship: userData.citizenship || undefined,
          schoolStatus: userData.schoolStatus || undefined,
          degreeType: userData.degreeType || undefined,
          yearOfStudy: userData.yearOfStudy || undefined,
          fieldOfStudy: userData.fieldOfStudy || undefined,
          gpa: userData.gpa || undefined,
          incomeBracket: userData.incomeBracket || undefined,
          financialNeed: userData.financialNeed,
          ethnicity: userData.ethnicity || undefined,
          identifiers: userData.identifiers || [],
          email: user?.email || undefined,
          firstName: user?.user_metadata?.first_name || undefined,
          lastName: user?.user_metadata?.last_name || undefined,
        };

        console.log("Saving profile data:", finalUserProfile);

        // Save to Supabase if user is authenticated
        if (user?.id) {
          try {
            const savedProfile = await upsertUserProfile(
              user.id,
              finalUserProfile
            );
            console.log("Profile saved successfully:", savedProfile);
          } catch (saveError) {
            console.error("Failed to save profile to Supabase:", saveError);
            // Continue with navigation even if save fails
          }
        }

        // Call the onComplete callback with legacy format for backward compatibility
        const legacyProfile = {
          age: Number(userData.age),
          country: userData.country,
          gender: userData.genderIdentity,
          citizenship: userData.citizenship,
          education: userData.schoolStatus,
          degreeType: userData.degreeType,
          yearOfStudy: userData.yearOfStudy,
          fieldOfStudy: userData.fieldOfStudy,
          gpa: userData.gpa,
          incomeBracket: userData.incomeBracket,
          financialNeed: userData.financialNeed,
          ethnicity: userData.ethnicity,
          identifiers: userData.identifiers,
        };

        onComplete(legacyProfile);
        navigate("/dashboard", { state: legacyProfile });
      } catch (error) {
        console.error("Error saving profile:", error);
        // Still navigate to dashboard even if save fails (for guest users)
        const legacyProfile = {
          age: Number(userData.age),
          country: userData.country,
          gender: userData.genderIdentity,
          citizenship: userData.citizenship,
          education: userData.schoolStatus,
          degreeType: userData.degreeType,
          yearOfStudy: userData.yearOfStudy,
          fieldOfStudy: userData.fieldOfStudy,
          gpa: userData.gpa,
          incomeBracket: userData.incomeBracket,
          financialNeed: userData.financialNeed,
          ethnicity: userData.ethnicity,
          identifiers: userData.identifiers,
        };
        onComplete(legacyProfile);
        navigate("/dashboard", { state: legacyProfile });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/");
    } else {
      setStep(step - 1);
      setProgress(((step - 1) / totalSteps) * 100);
    }
  };

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (item: string) => {
    setUserData((prev) => {
      const updated = [...prev.identifiers];
      const index = updated.indexOf(item);
      if (index === -1) updated.push(item);
      else updated.splice(index, 1);
      return { ...prev, identifiers: updated };
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Tell us about yourself
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Age</Label>
                <Select
                  value={userData.age}
                  onValueChange={(value) => updateUserData("age", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your age" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
                      <SelectItem key={age} value={String(age)}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Country of Residence</Label>
                <Select
                  value={userData.country}
                  onValueChange={(value) => updateUserData("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...countries]
                      .sort((a, b) =>
                        a.name.common.localeCompare(b.name.common)
                      )
                      .map((c) => (
                        <SelectItem key={c.cca2} value={c.name.common}>
                          {c.name.common}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Identity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Gender</Label>
                <RadioGroup
                  value={userData.genderIdentity}
                  onValueChange={(value) =>
                    updateUserData("genderIdentity", value)
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  {["Woman", "Man", "Non-binary", "Prefer not to say"].map(
                    (g) => (
                      <div key={g} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={g}
                          id={g}
                          className="border-2 border-white data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-400 flex items-center justify-center"
                        />
                        <Label htmlFor={g}>{g.replace("-", " ")}</Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              </FormGroup>
              <FormGroup>
                <Label>Residency / Citizenship</Label>
                <Select
                  value={userData.citizenship}
                  onValueChange={(value) =>
                    updateUserData("citizenship", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Citizenship",
                      "Permanent Resident (PR)",
                      "International Student",
                      "Temporary Resident",
                      "Work Permit Holder",
                      "Refugee",
                      "Other",
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Education Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Current Education Status</Label>
                <Select
                  value={userData.schoolStatus}
                  onValueChange={(value) =>
                    updateUserData("schoolStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education status" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "High School",
                      "Undergraduate",
                      "Graduate",
                      "Not in School",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>

              {(userData.schoolStatus === "Undergraduate" ||
                userData.schoolStatus === "Graduate") && (
                <>
                  <FormGroup>
                    <Label>Degree Type</Label>
                    <Select
                      value={userData.degreeType}
                      onValueChange={(value) =>
                        updateUserData("degreeType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree type" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Diploma",
                          "Bachelor's",
                          "Master's",
                          "PhD",
                          "Other",
                        ].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Year of Study</Label>
                    <Select
                      value={userData.yearOfStudy}
                      onValueChange={(value) =>
                        updateUserData("yearOfStudy", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "1st Year",
                          "2nd Year",
                          "3rd Year",
                          "4th Year",
                          "5th Year",
                          "Final Year",
                        ].map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormGroup>
                </>
              )}
            </CardContent>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Field of Study</Label>
                <Input
                  value={userData.fieldOfStudy}
                  onChange={(e) =>
                    updateUserData("fieldOfStudy", e.target.value)
                  }
                  placeholder="Ex: Computer Science, Engineering"
                />
              </FormGroup>
              <FormGroup>
                <Label>Current GPA</Label>
                <Select
                  value={userData.gpa}
                  onValueChange={(value) => updateUserData("gpa", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GPA (4.0 scale)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 21 }, (_, i) => (i * 0.2).toFixed(1))
                      .reverse()
                      .map((gpa) => (
                        <SelectItem key={gpa} value={gpa}>
                          {gpa}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Financial & Ethnicity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Household Income</Label>
                <Select
                  value={userData.incomeBracket}
                  onValueChange={(value) => {
                    updateUserData("incomeBracket", value);
                    updateUserData("financialNeed", value === "Under-25k");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                    <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                    <SelectItem value="Over-100k">Over $100,000</SelectItem>
                  </SelectContent>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Ethnicity</Label>
                <Select
                  value={userData.ethnicity}
                  onValueChange={(value) => updateUserData("ethnicity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "African",
                      "South Asian",
                      "East Asian",
                      "Hispanic",
                      "Indigenous",
                      "Middle Eastern",
                      "Caucasian",
                      "Multiracial",
                      "Other",
                      "Prefer not to say",
                    ].map((ethnicity) => (
                      <SelectItem key={ethnicity} value={ethnicity}>
                        {ethnicity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Additional Identifiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormGroup>
                <Label>Select all that apply</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    "BIPOC",
                    "LGBTQ+",
                    "First Generation Student",
                    "Low Income",
                    "Newcomer/Immigrant",
                    "Person with Disability",
                    "Indigenous",
                    "Veteran",
                  ].map((id) => (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={userData.identifiers.includes(id)}
                        onCheckedChange={() => toggleArrayItem(id)}
                        className="border-2 border-white data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-400 data-[state=checked]:text-white flex items-center justify-center"
                      />
                      <Label htmlFor={id}>{id}</Label>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <OnboardingSEO />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="mb-8">
            <Progress
              value={progress}
              className="h-2 bg-blue-800 [&>div]:bg-white"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground text-white">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <Card className="bg-slate-800 text-white border border-slate-700">
            {renderStep()}
            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-colors duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : step === totalSteps ? (
                  <>
                    <Check className="h-4 w-4" /> Complete
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" /> Next
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

// Wrap with error boundary for production safety
import { InlineErrorBoundary } from "./error-boundaries";

const OnboardingFlowWithErrorBoundary = () => (
  <InlineErrorBoundary componentName="Onboarding Flow">
    <OnboardingFlow />
  </InlineErrorBoundary>
);

export default OnboardingFlowWithErrorBoundary;
