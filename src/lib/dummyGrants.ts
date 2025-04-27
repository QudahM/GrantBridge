export interface DummyGrant {
    id: string;
    title: string;
    organization: string;
    amount: number;
    deadline: string;
    eligibility: string[];
    requirements: string[];
    description: string;
    tags: string[];
    difficulty: "Easy" | "Medium" | "Hard";
  }
  
  export const dummyGrants: DummyGrant[] = [
    {
      id: "1",
      title: "Women in Tech Scholarship",
      organization: "Tech for All Foundation",
      amount: 5000,
      deadline: "2025-06-30",
      eligibility: ["Women", "Computer Science majors", "Undergraduate"],
      requirements: ["Personal Essay", "Transcript", "Recommendation Letter"],
      description: "Supporting women pursuing degrees in computer science and engineering.",
      tags: ["Technology", "Diversity", "Women"],
      difficulty: "Medium",
    },
    {
      id: "2",
      title: "Future Leaders Grant",
      organization: "Global Leaders Initiative",
      amount: 4000,
      deadline: "2025-07-15",
      eligibility: ["Underrepresented students", "Leadership experience"],
      requirements: ["Leadership Essay", "Resume"],
      description: "Empowering young leaders committed to community impact.",
      tags: ["Leadership", "Community", "Diversity"],
      difficulty: "Easy",
    },
    {
      id: "3",
      title: "First Generation College Scholarship",
      organization: "Opportunity Now",
      amount: 6000,
      deadline: "2024-05-10",
      eligibility: ["First Generation students", "Financial Need"],
      requirements: ["Financial Statement", "Personal Story"],
      description: "Helping first-generation college students succeed.",
      tags: ["First Generation", "Equity", "Support"],
      difficulty: "Medium",
    },
    {
      id: "4",
      title: "Environmental Changemakers Fellowship",
      organization: "Green Earth Foundation",
      amount: 7000,
      deadline: "2024-08-01",
      eligibility: ["Environmental Studies majors", "Activists"],
      requirements: ["Research Proposal", "Volunteer Experience"],
      description: "Funding young innovators tackling climate change.",
      tags: ["Environment", "Innovation", "Research"],
      difficulty: "Hard",
    },
    {
      id: "5",
      title: "Global Health Scholars Program",
      organization: "World Health Partners",
      amount: 8000,
      deadline: "2024-09-01",
      eligibility: ["Healthcare majors", "Public Health students"],
      requirements: ["Statement of Purpose", "Academic Transcript"],
      description: "Scholarships for students committed to global health initiatives.",
      tags: ["Healthcare", "Global Health", "Public Service"],
      difficulty: "Medium",
    },
    {
      id: "6",
      title: "Tech for Good Award",
      organization: "Impact Tech",
      amount: 3000,
      deadline: "2024-05-25",
      eligibility: ["Technology majors", "Social Impact Projects"],
      requirements: ["Project Portfolio", "Impact Statement"],
      description: "Recognizing tech projects making a difference in society.",
      tags: ["Technology", "Social Impact", "Innovation"],
      difficulty: "Easy",
    },
    {
      id: "7",
      title: "Minority STEM Innovators Grant",
      organization: "STEM Diversity Initiative",
      amount: 5500,
      deadline: "2024-06-20",
      eligibility: ["BIPOC students", "STEM fields"],
      requirements: ["Research Paper", "Recommendation Letter"],
      description: "Grant for minority students conducting research in STEM.",
      tags: ["Diversity", "STEM", "Research"],
      difficulty: "Medium",
    },
    {
      id: "8",
      title: "Creative Arts Talent Scholarship",
      organization: "Artistry Fund",
      amount: 4500,
      deadline: "2024-07-05",
      eligibility: ["Fine Arts majors", "Performing Arts majors"],
      requirements: ["Portfolio", "Performance Video"],
      description: "Supporting creative talents in fine and performing arts.",
      tags: ["Arts", "Creativity", "Talent"],
      difficulty: "Easy",
    },
  ];
  