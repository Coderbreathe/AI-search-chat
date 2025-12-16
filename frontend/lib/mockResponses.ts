/**
 * Mock responses for Phase 2 (before real AI integration)
 * These simulate what the AI would respond with
 */

const mockResponses: Record<string, string> = {
  // Greetings
  hello: "Hello! I'm your AI assistant. I can help you search for information, answer questions, and analyze documents. What would you like to know?",
  hi: "Hi there! How can I assist you today?",
  hey: "Hey! What can I help you with?",
  
  // Common questions
  'machine learning': "Machine learning is a subset of artificial intelligence (AI) that focuses on building systems that can learn from and make decisions based on data. Instead of being explicitly programmed to perform a task, machine learning algorithms use statistical techniques to identify patterns in data and improve their performance over time.\n\nKey concepts include:\n• Supervised learning: Training on labeled data\n• Unsupervised learning: Finding patterns in unlabeled data\n• Neural networks: Models inspired by the human brain\n• Deep learning: Complex neural networks with multiple layers",
  
  'quantum computing': "Quantum computing is a revolutionary approach to computation that leverages the principles of quantum mechanics. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or 'qubits' that can exist in multiple states simultaneously through superposition.\n\nKey advantages:\n• Exponentially faster for certain problems\n• Can solve complex optimization problems\n• Potential applications in cryptography, drug discovery, and AI\n• Still in early stages of development",
  
  'climate change': "Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, scientific evidence shows that human activities, particularly the burning of fossil fuels, have been the dominant cause of warming since the mid-20th century.\n\nKey impacts:\n• Rising global temperatures\n• Melting ice caps and rising sea levels\n• More frequent extreme weather events\n• Changes in precipitation patterns\n• Threats to biodiversity and ecosystems",
}

/**
 * Generate a mock response based on user input
 */
export function generateMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase().trim()
  
  // Check for exact or partial matches in our mock responses
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowerMessage.includes(key)) {
      return response
    }
  }
  
  // Check for question patterns
  if (lowerMessage.includes('what is') || lowerMessage.includes('what are')) {
    return generateWhatIsResponse(userMessage)
  }
  
  if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('do'))) {
    return generateHowResponse(userMessage)
  }
  
  if (lowerMessage.includes('why')) {
    return generateWhyResponse(userMessage)
  }
  
  if (lowerMessage.includes('explain') || lowerMessage.includes('tell me about')) {
    return generateExplanationResponse(userMessage)
  }
  
  // Default responses based on message characteristics
  if (lowerMessage.endsWith('?')) {
    return generateQuestionResponse(userMessage)
  }
  
  if (lowerMessage.split(' ').length < 5) {
    return generateShortQueryResponse(userMessage)
  }
  
  // Generic fallback
  return generateGenericResponse(userMessage)
}

function generateWhatIsResponse(query: string): string {
  return `That's an interesting question about "${query}". In a real implementation, I would search through documents and provide a comprehensive answer with citations. For now, I can tell you that this topic likely involves multiple aspects that would require detailed research.\n\nKey points to consider:\n• Historical context and background\n• Current understanding and definitions\n• Practical applications and examples\n• Related concepts and theories\n\nIn Phase 3, I'll be connected to real AI to provide accurate, cited responses!`
}

function generateHowResponse(query: string): string {
  return `Great question about how something works! To properly answer "${query}", I would typically:\n\n1. Search relevant documents and sources\n2. Analyze the information found\n3. Synthesize a clear explanation\n4. Provide citations for verification\n\nOnce integrated with real AI in Phase 3, I'll be able to give you detailed, step-by-step explanations with references to authoritative sources.`
}

function generateWhyResponse(query: string): string {
  return `You're asking "why" - which often requires deep analysis and multiple perspectives. For "${query}", a complete answer would involve:\n\n• Understanding the underlying causes\n• Examining historical factors\n• Considering multiple viewpoints\n• Providing evidence-based reasoning\n\nWith real AI integration coming in Phase 3, I'll be able to provide nuanced, well-researched answers to complex "why" questions.`
}

function generateExplanationResponse(query: string): string {
  return `I'd be happy to explain! For the topic "${query}", a thorough explanation would cover:\n\n📚 Background and fundamentals\n🔍 Key concepts and terminology  \n💡 Practical examples and applications\n🔗 Related topics and further reading\n\nCurrently, I'm using mock responses for Phase 2 development. In Phase 3, I'll connect to real AI to provide accurate, detailed explanations with proper citations from reliable sources.`
}

function generateQuestionResponse(query: string): string {
  return `That's a great question! "${query}"\n\nTo answer this properly, I would need to:\n• Search through relevant documents and databases\n• Analyze the most current and accurate information\n• Synthesize findings into a clear response\n• Provide citations for transparency\n\nThis is a mock response for Phase 2. Once connected to real AI (Phase 3), I'll provide comprehensive, cited answers to all your questions!`
}

function generateShortQueryResponse(query: string): string {
  return `Regarding "${query}" - this is a broad topic that could be explored in many directions. \n\nWhat specific aspect would you like to know more about? I can help with:\n• General overview and definitions\n• Historical context\n• Current applications\n• Technical details\n• Related concepts\n\nFeel free to ask a more specific question, and I'll provide a detailed response!`
}

function generateGenericResponse(query: string): string {
  return `Thank you for your message: "${query}"\n\nI understand you're interested in this topic. In a production environment with real AI:\n\n✓ I would search relevant documents\n✓ Extract key information with citations\n✓ Provide a comprehensive, accurate response\n✓ Include source references for verification\n\nThis is Phase 2, where I'm demonstrating the chat interface with mock responses. Real AI integration is coming in Phase 3!\n\nTry asking about "machine learning", "quantum computing", or "climate change" to see more detailed mock responses.`
}

/**
 * Get a random response from a list (for variety)
 */
export function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)]
}