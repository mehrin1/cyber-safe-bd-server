export type SurveyQuestionType = "SHORT_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SCALE";

export interface SurveyQuestionDefinition {
  key: string;
  externalId: string;
  prompt: string;
  description?: string;
  type: SurveyQuestionType;
  required: boolean;
  options?: string[];
}

export interface SurveySectionDefinition {
  key: string;
  title: string;
  description?: string;
  questions: SurveyQuestionDefinition[];
}

const scale = ["0", "1", "2", "3", "4"];
const yesNoNotSure = ["Yes", "No", "Not Sure"];
const yesNo = ["Yes", "No"];

const q = (
  key: string,
  externalId: string,
  prompt: string,
  type: SurveyQuestionType,
  required: boolean,
  options?: string[],
  description?: string,
): SurveyQuestionDefinition => ({ key, externalId, prompt, type, required, options, description });

export const cyberSafetySurvey = {
  slug: "cyberbullying-resilience-legal-awareness-bd",
  title: "Assessment of Cyberbullying, Cybersecurity Resilience, and Legal Awareness in Bangladesh",
  sections: [
    {
      key: "participant-information",
      title: "Section 1: Participant Information",
      questions: [
        q("email", "226555710", "Email (Optional)", "SHORT_TEXT", false, undefined, "[ If you want updates on your contribution on this research or future outcomes of the intended paper ]"),
        q("age", "1473610182", "Age", "SINGLE_CHOICE", true, ["15-18", "19-25", "26-35", "35+", "36-45", "46-55", "55+"]),
        q("gender", "808025826", "Gender", "SINGLE_CHOICE", true, ["Male", "Female", "Others"]),
        q("profession", "157362076", "Profession", "SHORT_TEXT", false),
        q("education-level", "863352157", "Education Level", "SINGLE_CHOICE", true, ["School", "College", "University", "Graduate", "Other"]),
        q("residence", "1976912492", "Residence", "SINGLE_CHOICE", true, ["Urban", "Rural"]),
        q("division", "2079187585", "Division", "SINGLE_CHOICE", true, ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"]),
        q("daily-internet-usage", "594073399", "Average Daily Internet Usage", "SINGLE_CHOICE", true, ["Less than 2 hours", "2–4 hours", "5–7 hours", "More than 7 hours"]),
        q("frequent-platform", "1921748421", "Most Frequently Used Platform", "MULTIPLE_CHOICE", false, ["Facebook", "linkedIn", "Messenger", "Instagram", "Telegram", "Email services (dropdown menu for google, apple, outlook, yahoo etc)", "TikTok", "WhatsApp", "Discord", "Online Gaming Platform", "YouTube", "Other"]),
      ],
    },
    {
      key: "cyberbullying-experience",
      title: "Cyberbullying / Cybercrime Experience",
      description: "Please answer this section based on whether you have experienced any cyberbullying or online threats and provide additional details if applicable:",
      questions: [
        q("harm-frequency", "1052132598", "Have you experienced any form of cyberbullying / online harmful activity in the past 1 year?", "SINGLE_CHOICE", true, ["Once", "Occasionally", "Frequently", "Never", "Yes", "No"]),
        q("harm-types", "229714187", "Which types of online harmful activities have you experienced?", "MULTIPLE_CHOICE", false, ["Harassment", "Threatening messages", "Fake profile / impersonation", "Rumor spreading", "Financial scam / fraud attempt", "Non-consensual image sharing", "Blackmail / sextortion", "Hacking / account misuse", "Public humiliation", "Other"]),
        q("incident-stress", "508666459", "How emotionally stressful was the most serious online incident you experienced?", "SINGLE_CHOICE", false, ["Not stressful", "Slightly stressful", "Moderately stressful", "Very stressful", "Extremely stressful"]),
        q("help-sought", "1251705307", "Did you seek help after the incident?", "SINGLE_CHOICE", false, ["Friends", "Family", "Teacher", "Police", "Lawyer", "Mental health professional", "Online community", "Nobody", "Not applicable"]),
      ],
    },
    {
      key: "psychological-resilience",
      title: "Psychological Resilience (CD-RISC-10)",
      description: "Please rate how true each statement has been for you during stressful experiences or incidents in the past 12 months:\n0 = Not true at all\n1 = Rarely true\n2 = Sometimes true\n3 = Often true\n4 = True nearly all the time",
      questions: [
        q("resilience-1", "2092415893", "1. I am able to adapt when changes occur.", "SCALE", true, scale),
        q("resilience-2", "1535109742", "2. I can deal with whatever comes my way.", "SCALE", true, scale),
        q("resilience-3", "316126342", "3.I try to see the humorous side of problems.", "SCALE", true, scale),
        q("resilience-4", "114616355", "4. Having to cope with stress can make me stronger.", "SCALE", true, scale),
        q("resilience-5", "515783291", "5. I tend to bounce back after illness or hardship.", "SCALE", true, scale),
        q("resilience-6", "742397789", "6. I can achieve goals despite obstacles.", "SCALE", true, scale),
        q("resilience-7", "1818880151", "7. Under pressure, I stay focused and think clearly.", "SCALE", true, scale),
        q("resilience-8", "412787155", "8. I am not easily discouraged by failure.", "SCALE", true, scale),
        q("resilience-9", "1717319856", "9. I think of myself as a strong person when dealing with life’s challenges.", "SCALE", true, scale),
        q("resilience-10", "1227518023", "10. I am able to handle unpleasant feelings.", "SCALE", true, scale),
      ],
    },
    {
      key: "coping-strategies",
      title: "Practical Coping Strategies in Cyberbullying Situations",
      description: "The following questions describe real-life online situations. Please select the option that best represents what you would take first",
      questions: [
        q("coping-private-image", "1487268277", "A friend tells you that someone has shared her private photo online without permission. What should she do first?", "SINGLE_CHOICE", true, ["Post the offender’s details publicly so others can shame them.", "Temporarily deactivate her accounts to avoid further stress.", "Collect screenshots and links, report the content, and seek trusted or legal support.", "Wait for a few days to see whether the content disappears on its own."]),
        q("coping-impersonation", "1139443273", "Someone creates a fake account using your identity.", "SINGLE_CHOICE", true, ["Warn close contacts, document the profile information, and report the impersonation account.", "Freeze or deactivate your real account until the situation settles.", "Create another account to publicly expose or confront the impersonator.", "Ignore the account unless someone directly informs you about suspicious activity."]),
        q("coping-threats", "416210420", "You receive repeated threatening messages from anonymous accounts.", "SINGLE_CHOICE", true, ["Respond aggressively to discourage the sender from continuing.", "Continue communicating to understand why they are targeting you.", "Save the messages, block/report the sender, and explore official support options.", "Delete the conversations immediately and avoid reopening the platform."]),
        q("coping-account-security", "56401955", "You notice unauthorized login attempts and suspicious activity on your social media or email account.", "SINGLE_CHOICE", true, ["Ignore the security warnings unless access to the account is lost.", "Permanently delete the account to prevent further risks.", "Share your login credentials with trusted friends for assistance monitoring the account.", "Change passwords immediately, enable two-factor authentication, and review account activity."]),
        q("coping-prize-scam", "2144494517", "You receive a message claiming you won a large cash prize and are asked to log in through a link to verify your account information.", "SINGLE_CHOICE", true, ["Open the link immediately to verify whether the offer is real.", "Forward the message to friends to ask whether they think it is legitimate.", "Reply to the sender asking for additional proof before deciding.", "Ignore the message, avoid interacting with the link, and report or block the sender."]),
        q("coping-sextortion", "162509339", "Someone threatens to publish your private content unless you send money or additional personal content.", "SINGLE_CHOICE", true, ["Block the individual and remove your account from social media platforms.", "Pay the requested amount or try persuading them not to share the content.", "Threaten to expose or retaliate against the offender publicly.", "Preserve conversation records, profile information, and evidence before seeking support from appropriate authorities."]),
        q("coping-friend", "377337161", "Your friend is being cyberbullied and feels mentally stressed.", "SINGLE_CHOICE", true, ["Encourage them to permanently leave all social media platforms.", "Advise them to ignore the situation completely and avoid reacting.", "Encourage them to publicly expose the offenders online.", "Preserve conversation records, profile information, and evidence before seeking support from appropriate authorities."]),
      ],
    },
    {
      key: "legal-awareness",
      title: "⚖️ Cyber Law & Digital Safety Awareness সাইবার আইন সচেতনতা (বাংলাদেশ)",
      description: "Please answer based on your current knowledge about cyber laws and digital rights in Bangladesh",
      questions: [
        q("law-private-image", "1623832151", "1. Is sharing someone’s private image/video without consent punishable under Bangladeshi law?", "MULTIPLE_CHOICE", true, yesNoNotSure),
        q("law-fake-account", "517846101", "2. Can creating a fake social media account using another person’s identity lead to legal consequences?", "MULTIPLE_CHOICE", true, yesNoNotSure),
        q("law-threats", "1701799685", "3. Can online threats and harassment be treated as criminal offenses in Bangladesh?", "MULTIPLE_CHOICE", true, yesNoNotSure),
        q("law-sextortion", "878699699", "4. Is digital blackmail (sextortion) punishable under Bangladeshi law?", "MULTIPLE_CHOICE", true, yesNoNotSure),
        q("law-account-access", "1012814762", "5. Is unauthorized access to someone’s online account considered punishable under cyber law?", "MULTIPLE_CHOICE", true, yesNoNotSure),
        q("law-phishing", "530517822", "6. Do you know that phishing or online financial fraud can be reported as cybercrime in Bangladesh?", "MULTIPLE_CHOICE", true, yesNoNotSure),
        q("law-evidence", "410001098", "7. Do you know what type of digital evidence should be preserved before reporting cybercrime?", "MULTIPLE_CHOICE", true, yesNo),
        q("law-support", "2114496394", "8. Would you feel confident seeking legal or law enforcement support if you became a victim of cybercrimes?", "MULTIPLE_CHOICE", true, yesNo),
        q("law-authority", "1074657876", "9. Do you know which authority or platform can officially receive cybercrime complaints in Bangladesh?", "MULTIPLE_CHOICE", true, yesNo),
        q("law-procedure", "1011797595", "10. Do you know the exact procedural steps required to file a digital security complaint in Bangladesh?", "MULTIPLE_CHOICE", true, yesNo),
      ],
    },
    {
      key: "centralized-platform",
      title: "Need for a Centralized Cyber Support Platform",
      description: "This section gathers your feedback on whether Bangladesh needs a centralized online platform for cyber safety and what tools or resources would be most helpful to victims of cybercrime",
      questions: [
        q("platform-need", "847696875", "Do you think Bangladesh needs a centralized online platform for cybercrime awareness and victim support?", "SINGLE_CHOICE", true, ["Yes", "No", "Not sure"]),
        q("platform-use", "122556242", "Would you use an online platform like this if you or someone you know experienced a cybercrime?", "SINGLE_CHOICE", true, ["Yes", "No", "Not sure"]),
        q("platform-features", "1326941069", "Which features would be most useful to you on a cyber awareness platform?", "MULTIPLE_CHOICE", false, ["Cybercrime awareness articles", "Step-by-step reporting guide", "Legal Rights and Cyber Law Informations", "Digital Evidence Preservation Guide", "Complaint resources", "Expert consultations(lawyer/pschiatrist/law enforcement)", "Anonymous support community", "Psychological/Legal support", "Other"]),
      ],
    },
  ] satisfies SurveySectionDefinition[],
};
