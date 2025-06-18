"use client"
import { useState } from "react"
import { ChevronRight } from "lucide-react"

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "Is Roshe Mentorship free to use?",
      answer:
        "Yes, Roshe Mentorship offers a free tier with basic features. We also offer premium plans with additional features and benefits for those who need more advanced mentorship tools and resources.",
    },
    {
      question: "How can i become a coach and earn money?",
      answer:
        "To become a coach on Roshe Mentorship, you need to apply through our website, meet our mentor criteria, and complete the verification process. Once approved, you can set your rates and start earning by providing mentorship services to our community members.",
    },
    {
      question: "Roshe Mentorship Mentor Criteria",
      answer:
        "Our mentor criteria includes having relevant industry experience, demonstrable expertise in your field, strong communication skills, and a commitment to our community guidelines. We also require mentors to complete a background check and provide professional references.",
    },
    {
      question: "Is Roshe Mentorship hiring?",
      answer:
        "We're always looking for talented individuals to join our team. Please check our careers page for current openings or send your resume to careers@roshementorship.com for future opportunities.",
    },
    {
      question: "I have a feature request",
      answer:
        "We welcome feature requests from our community! Please submit your ideas through our feedback form or email them to feedback@roshementorship.com. Our product team reviews all suggestions and prioritizes them based on community needs and our development roadmap.",
    },
    {
      question: "Roshe Mentorship Community Guidelines",
      answer:
        "Our community guidelines emphasize respect, inclusivity, and professional conduct. All members are expected to communicate respectfully, honor commitments, maintain confidentiality, and contribute positively to the community. Full guidelines are available in your account dashboard.",
    },
    {
      question: "Mentee and Mentor Standards",
      answer:
        "Mentees are expected to come prepared to sessions, be respectful of mentors' time, and actively participate in the mentorship process. Mentors are expected to provide quality guidance, be punctual, maintain professional boundaries, and continuously improve their mentorship skills.",
    },
    {
      question: "How to Reset Your Password",
      answer:
        "To reset your password, click on the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your email. For security reasons, password reset links expire after 24 hours.",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-8 py-20 bg-white text-black">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">FAQs</h1>
      <p className="text-lg text-gray-600 mb-12">Frequently asked questions by our community</p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-gray-100">
            <button
              onClick={() => toggleFAQ(index)}
              className="flex items-center justify-between w-full py-6 px-6 text-left focus:outline-none bg-white rounded-lg"
            >
              <div className="flex items-center">
                <ChevronRight
                  className={`mr-4 h-5 w-5 text-gray-700 transition-transform ${
                    openIndex === index ? "transform rotate-90" : ""
                  }`}
                />
                <span className="text-gray-900 font-medium text-lg">{faq.question}</span>
              </div>
            </button>
            {openIndex === index && (
              <div className="pl-14 pr-6 pb-8 pt-2 bg-white">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
            <div className="border-b border-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
