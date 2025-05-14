import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BrainIcon,
  ClipboardCheckIcon,
  XIcon,
} from "lucide-react";

interface ApplicationAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaveGrant?: () => void;
  isSaved?: boolean;
  grantTitle?: string;
  grantDeadline?: string;
  grantAmount?: string;
  grantRequirements?: string[];
  grantLink?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ApplicationAssistant = ({
  isOpen = true,
  onClose = () => { },
  onSaveGrant = () => { },
  isSaved = false,
  grantTitle = "STEM Diversity Scholarship",
  grantDeadline = "May 15, 2023",
  grantAmount = "$5,000",
  grantRequirements = [
    "500-word personal statement",
    "Proof of enrollment",
    "Academic transcript",
    "Letter of recommendation",
  ],
  grantLink = "https://example.com/grant-application",
}: ApplicationAssistantProps) => {
  const [activeTab, setActiveTab] = useState("checklist");
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [draftResponse, setDraftResponse] = useState<string | null>(null);
  const [requirementDescriptions, setRequirementDescriptions] = useState<string[]>([]);
  const [isLoadingDraft, setisLoadingDraft] = useState(false);
  const [grantCriteria, setGrantCriteria] = useState<string | null>(null);
  const [grantUniqueFactor, setGrantUniqueFactor] = useState<string | null>(null);
  const [lastFetchedRequirements, setLastFetchedRequirements] = useState<string>("");
  const [lastFetchedTitle, setLastFetchedTitle] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(false);

  const getStableRequirementsKey = (reqs: string[]) =>
    reqs.map(r => r.trim().toLowerCase()).sort().join("||");

  React.useEffect(() => {
    if (!grantTitle || grantTitle === lastFetchedTitle) return;

    const fetchGrantExplanation = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/explain-grant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: grantTitle, requirements: grantRequirements }),
        });

        const data = await res.json();
        setGrantCriteria(data.criteria);
        setGrantUniqueFactor(data.unique);
        setLastFetchedTitle(grantTitle);
      } catch (err) {
        console.error("Failed to fetch grant explanation", err);
      }
    };

    fetchGrantExplanation();
  }, [grantTitle, grantRequirements, lastFetchedTitle]);

  React.useEffect(() => {
    const reqKey = `${grantTitle?.trim().toLowerCase()}::${getStableRequirementsKey(grantRequirements)}`;
    if (reqKey === lastFetchedRequirements) return;

    const fetchDescriptions = async () => {
      setIsLoadingDescriptions(true);
      try {
        const res = await fetch(`${BASE_URL}/api/requirement-descriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements: grantRequirements }),
        });

        const data = await res.json();
        setRequirementDescriptions(data.descriptions || []);
        setLastFetchedRequirements(reqKey);
      } catch (err) {
        console.error("Failed to load requirement descriptions", err);
        setRequirementDescriptions(grantRequirements.map(() => "Description not available"));
      } finally {
        setIsLoadingDescriptions(false);
      }
    };

    fetchDescriptions();
  }, [grantRequirements, grantTitle, lastFetchedRequirements]);

  const toggleCompletedItem = (item: string) => {
    if (completedItems.includes(item)) {
      setCompletedItems(completedItems.filter((i) => i !== item));
    } else {
      setCompletedItems([...completedItems, item]);
    }
  };

  const handleGenerateDraft = async () => {
    setisLoadingDraft(true);
    setDraftResponse(null);
    const query = `Based on the following grant requirements, help me draft an application: ${grantRequirements.join("; ")}`;

    try {
      const response = await fetch(`${BASE_URL}/api/sonar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query })
      });

      const data = await response.json();
      setDraftResponse(data.answer || "No response received.");
    } catch (error) {
      console.error("Error generating draft:", error);
      setDraftResponse("There was an error generating your draft. Please try again.");
    } finally {
      setisLoadingDraft(false);
    }
  };

  /*  const suggestedPhrases = [
    "As a woman in STEM, I've navigated unique challenges that have strengthened my resolve and perspective.",
    "My background in computer science has equipped me with both technical skills and a passion for inclusive technology.",
  ];*/

  if (!isOpen) return null;

  const formatDraftText = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold markdown
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")     // bold asterisk-surrounded text
      .replace(/^##\s*(.*)$/gm, "<div class=\"text-base font-bold mt-3 \">$1</div>")
      .replace(/\[\d+\]/g, "");
  }

  const formatExplainText = (text: string): string => {
    return text
      .replace(/\[\d+\]/g, "")                         // Remove [1], [2], etc.
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold **text**
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>");   // Bold *text*
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 h-screen w-full sm:w-[450px] bg-background border-l shadow-xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Application Assistant</h2>
          {grantLink ? (
            <a
              href={grantLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              {grantTitle}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">{grantTitle}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="outline" className="mb-1">
              Deadline: {grantDeadline}
            </Badge>
            <h3 className="text-lg font-medium">{grantAmount}</h3>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="checklist"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="checklist" className="flex-1">
              <ClipboardCheckIcon className="h-4 w-4 mr-2" />
              Checklist
            </TabsTrigger>
            {/* Commented out for now to find a better replacement
            <TabsTrigger value="phrases" className="flex-1">
              <PenIcon className="h-4 w-4 mr-2" />
              Phrases
            </TabsTrigger>
            */}
            <TabsTrigger value="explain" className="flex-1">
              <BrainIcon className="h-4 w-4 mr-2" />
              Explain
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto px-4 pb-4">
          {activeTab === "checklist" && (
            <TabsContent value="checklist" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Application Requirements</CardTitle>
                  <CardDescription>
                    Track your progress through the application process.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grantRequirements.map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Checkbox
                          id={`requirement-${index}`}
                          checked={completedItems.includes(requirement)}
                          onCheckedChange={() => toggleCompletedItem(requirement)}
                        />
                        <div className="grid gap-1.5">
                          <label
                            htmlFor={`requirement-${index}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${completedItems.includes(requirement) ? "line-through text-muted-foreground" : ""}`}
                          >
                            {(() => {
                              const cleaned = requirement.replace(/^[-–•*]\s*/, "").trim();
                              const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                              return capitalized.endsWith(".") ? capitalized : capitalized + ".";
                            })()}
                          </label>
                          <p className="text-sm text-foreground">
                            {isLoadingDescriptions
                              ? "Loading..."
                              : (() => {
                                const desc = requirementDescriptions[index];
                                if (!desc) return "";
                                const cleaned = desc.replace(/\[\d+\]/g, "").trim();
                                return cleaned.endsWith(".") ? cleaned : cleaned + ".";
                              })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleGenerateDraft}>Generate application draft</Button>
                </CardFooter>
              </Card>
              {isLoadingDraft && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Loading draft...</CardTitle>
                    <CardDescription>Generating your draft application...</CardDescription>
                  </CardHeader>
                </Card>
              )}

              {!isLoadingDraft && draftResponse && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Draft Application</CardTitle>
                    <CardDescription>
                      Here is a draft application based on the given requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm text-foreground"
                      dangerouslySetInnerHTML={{ __html: formatDraftText(draftResponse) }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Commented out for now to find a better replacement
          {activeTab === "phrases" && (
            <TabsContent value="phrases" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Phrases</CardTitle>
                  <CardDescription>
                    Personalized content based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suggestedPhrases.map((phrase, index) => (
                      <div
                        key={index}
                        className="group relative p-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <p className="text-sm">{phrase}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <CopyIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Textarea
                    placeholder="Write your own custom phrase here..."
                    className="min-h-[100px]"
                  />
                  <Button className="w-full">Generate more phrases</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
          */}
          {activeTab === "explain" && (
            <TabsContent value="explain" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grant Explanation</CardTitle>
                  <CardDescription>
                    Understanding what this grant is looking for.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-medium mb-2">Key Selection Criteria</h4>
                      <ul className="text-sm text-foreground list-disc list-inside space-y-1">
                        {(Array.isArray(grantCriteria) ? grantCriteria : [])
                          .map((item, index) => {
                            const [title, ...rest] = item.replace(/^•\s*/, "").split(":");
                            const description = rest.join(":").trim(); // in case ":" appears in description
                            return (
                              <li key={index}>
                                <span className="font-medium">{title.trim()}:</span>{" "}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: formatExplainText(
                                      description.endsWith(".") ? description : description + "."
                                    ),
                                  }}
                                />
                              </li>
                            );
                          })}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">What Makes This Grant Unique</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: formatExplainText(grantUniqueFactor || "Loading...") }} />

                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3">
                  {chatHistory.map((entry, idx) => (
                    <div key={idx} className="space-y-2 w-full">
                      <div className="max-w-[80%] bg-blue-100 text-blue-900 rounded-lg px-4 py-2 self-end ml-auto">
                        <p className="text-sm font-medium">You:</p>
                        <p className="text-sm">{entry.question}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                        <p className="font-medium text-primary">Sonar Response:</p>
                        <p dangerouslySetInnerHTML={{ __html: formatExplainText(entry.answer) }} />
                      </div>
                    </div>
                  ))}
                  {showChatInput ? (
                    <div className="w-full space-y-2">
                      <Textarea
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder="Ask something specific about this grant..."
                      />
                      <Button
                        disabled={isAsking || !userQuestion.trim()}
                        onClick={async () => {
                          setIsAsking(true);
                          try {
                            const response = await fetch(`${BASE_URL}/api/sonar`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                question: `Grant: ${grantTitle}. ${grantUniqueFactor}. Question: ${userQuestion}`,
                              }),
                            });

                            const data = await response.json();
                            const newEntry = {
                              question: userQuestion,
                              answer: data.answer || "No response received.",
                            };

                            setChatHistory((prev) => {
                              const updated = [...prev, newEntry];
                              return updated.length > 5 ? updated.slice(-5) : updated;
                            });

                            setUserQuestion("");
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsAsking(false);
                            setShowChatInput(false);
                          }
                        }}
                      >
                        Submit Question
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setShowChatInput(true)}>
                      Ask a specific question
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Button
            variant={isSaved ? "destructive" : "default"}
            className="flex-1"
            onClick={onSaveGrant}
          >
            {isSaved ? "Remove from saved" : "Save for later"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationAssistant;
