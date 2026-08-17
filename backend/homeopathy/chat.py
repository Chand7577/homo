import openai
from django.conf import settings
from typing import Dict, Optional
import json

openai.api_key = settings.OPENAI_API_KEY


class LeelaprasadKnowledgeBase:
    """
    Core knowledge base for Leelaprasad International Pvt Ltd (Lit Coffee)
    This serves as the foundational training data for the AI assistant
    """
    
    CORE_IDENTITY = {
        "company_name": "Leelaprasad International Pvt Ltd",
        "brand_name": "Lit Coffee",
        "founded": "2018",
        "founder": "Varun Leelaprasad (MBA graduate and coffee expert)",
        "headquarters": "Bangalore, Karnataka, India",
        "industry": "Coffee Export and Manufacturing",
        "tagline": "Leading Certified Indian Coffee Exporter, Manufacturer and Trusted Farmer Network"
    }
    
    CORE_FACTS = {
        "plantation_size": "250+ acres of owned coffee plantations",
        "farmer_network": "20,000+ farmers across Karnataka",
        "global_reach": "8,000+ clients in 17+ countries",
        "quality_record": "Zero quality rejections from international clients",
        "sourcing_regions": "Chikmagalur, Coorg, and Sakleshpur (Karnataka's coffee heartlands)",
        "export_countries": 32  # Based on target countries list
    }
    
    PRODUCTS = {
        "green_coffee_beans": {
            "varieties": ["Arabica", "Robusta"],
            "count": "20 different products",
            "description": "Premium Indian green coffee beans sourced directly from farmers"
        },
        "roasted_coffee_beans": {
            "count": "4 products",
            "description": "Expertly roasted Indian coffee beans for retail and wholesale"
        },
        "filter_coffee_powder": {
            "count": "4 products",
            "description": "Traditional Indian filter coffee powder and instant coffee"
        }
    }
    
    CERTIFICATIONS = [
        "Coffee Board of India",
        "FSSAI (Food Safety and Standards Authority of India)",
        "ISO 22000 (Food Safety Management)",
        "HACCP (Hazard Analysis Critical Control Points)",
        "EUDR (EU Deforestation Regulation)",
        "Organic Certification",
        "Fair Trade Certification",
        "Rainforest Alliance Certification"
    ]
    
    SERVICES = {
        "farming": "Direct sourcing from 20,000+ farmers and owned plantations with sustainable practices",
        "processing": "Advanced wet/dry processing, roasting, grinding, and hygienic packaging facilities",
        "quality_control": "Rigorous testing ensuring international food safety and quality standards",
        "logistics_export": "Efficient documentation and shipping with top global logistics partners"
    }
    
    CONTACT_INFO = {
        "head_office": {
            "address": "1930, 28th Cross, Vinayaka Layout, D-Group Layout, Gidada Konnenahalli, Annapurneshwari Nagar, Bengaluru, Karnataka 560091",
            "phone": "+91-9686995189",
            "email": "info@leelaprasadinternational.com"
        },
        "branch_office": {
            "address": "2nd Floor, SRS Nilaya behind KEB office, Kunigal, Tumakuru, Karnataka, India – 572130"
        }
    }
    
    KEY_DIFFERENTIATORS = [
        "Vertical integration: Farm to export control",
        "Direct farmer relationships ensuring traceability",
        "Zero rejection rate internationally",
        "Own 250-acre plantation plus extensive farmer network",
        "Multiple international certifications",
        "Sustainable and ethical farming practices",
        "Modern hygienic manufacturing facilities"
    ]
    
    TARGET_EXPORT_COUNTRIES = [
        "Italy", "Germany", "Russia", "Belgium", "Jordan", "UAE", "Turkey", 
        "Poland", "USA", "Libya", "Netherlands", "UK", "Switzerland", "Canada",
        "Australia", "Sweden", "South Korea", "France", "Spain", "Saudi Arabia",
        "Iran", "Egypt", "Greece", "Japan", "Malaysia", "Singapore", "Brazil",
        "China", "Indonesia", "Bangladesh", "India", "Israel"
    ]


def build_system_prompt() -> str:
    """
    Constructs the comprehensive system prompt with core Leelaprasad knowledge
    """
    kb = LeelaprasadKnowledgeBase
    
    system_prompt = f"""You are the official AI assistant for Leelaprasad International Pvt Ltd (also known as Lit Coffee).

CORE IDENTITY:
- Company: {kb.CORE_IDENTITY['company_name']}
- Brand: {kb.CORE_IDENTITY['brand_name']}
- Founded: {kb.CORE_IDENTITY['founded']} by {kb.CORE_IDENTITY['founder']}
- Based in: {kb.CORE_IDENTITY['headquarters']}
- Industry: {kb.CORE_IDENTITY['industry']}

WHAT WE DO:
We are a certified Indian coffee exporter and manufacturer specializing in premium Arabica and Robusta coffee beans. We own {kb.CORE_FACTS['plantation_size']}, work with {kb.CORE_FACTS['farmer_network']}, and serve {kb.CORE_FACTS['global_reach']}. We have {kb.CORE_FACTS['quality_record']}.

PRODUCTS:
1. Green Coffee Beans (Arabica & Robusta) - {kb.PRODUCTS['green_coffee_beans']['count']}
2. Roasted Coffee Beans - {kb.PRODUCTS['roasted_coffee_beans']['count']}
3. Filter & Instant Coffee Powder - {kb.PRODUCTS['filter_coffee_powder']['count']}

CERTIFICATIONS:
{', '.join(kb.CERTIFICATIONS)}

SERVICES:
- Farming: {kb.SERVICES['farming']}
- Processing: {kb.SERVICES['processing']}
- Quality Control: {kb.SERVICES['quality_control']}
- Logistics & Export: {kb.SERVICES['logistics_export']}

KEY STRENGTHS:
{chr(10).join(f"- {diff}" for diff in kb.KEY_DIFFERENTIATORS)}

CONTACT:
- Email: {kb.CONTACT_INFO['head_office']['email']}
- Phone: {kb.CONTACT_INFO['head_office']['phone']}
- Head Office: {kb.CONTACT_INFO['head_office']['address']}

PERSONALITY & TONE:
- Professional yet warm and approachable
- Expert knowledge in coffee cultivation, processing, and export
- Focus on quality, sustainability, and traceability
- Build trust through certifications and proven track record
- Helpful in guiding potential clients through the export process

GUIDELINES:
1. Answer questions accurately using the core knowledge provided
2. For complex technical questions or specific product details not in your core knowledge, acknowledge what you know and offer to connect them with the export team
3. Always emphasize our unique value: vertical integration, zero rejection rate, certifications
4. Guide prospects toward inquiry, sample requests, or contacting the export team
5. Be confident but honest - if you don't have specific information, say so and offer alternatives
6. For pricing, lead times, or custom orders, always direct to the sales team
7. Maintain professional standards while being conversational

Remember: You represent a premium, certified coffee exporter with an impeccable reputation. Every response should reinforce quality, trust, and expertise."""

    return system_prompt


def chat_with_leelaprasad(
    user_message: str, 
    conversation_history: Optional[list] = None,
    use_advanced_reasoning: bool = True
) -> Dict[str, str]:
    """
    Leelaprasad AI Assistant with API-based reasoning
    
    Args:
        user_message: The user's question or message
        conversation_history: Optional list of previous messages for context
        use_advanced_reasoning: Whether to use GPT-4 for complex reasoning
    
    Returns:
        Dictionary with 'response' and 'metadata'
    """
    
    # Initialize conversation history
    if conversation_history is None:
        conversation_history = []
    
    # Build the system prompt with core knowledge
    system_prompt = build_system_prompt()
    
    # Construct messages for API
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Add conversation history if exists
    messages.extend(conversation_history)
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    try:
        # Determine which model to use based on complexity
        model = "gpt-4-turbo" if use_advanced_reasoning else "gpt-3.5-turbo"
        
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        ai_reply = response.choices[0].message.content.strip()
        
        # Extract metadata
        metadata = {
            "model_used": model,
            "tokens_used": response.usage.total_tokens,
            "finish_reason": response.choices[0].finish_reason
        }
        
        return {
            "response": ai_reply,
            "metadata": metadata,
            "success": True
        }
        
    except openai.error.RateLimitError:
        return {
            "response": "I'm experiencing high demand right now. Please try again in a moment, or contact us directly at info@leelaprasadinternational.com or +91-9686995189.",
            "success": False,
            "error": "rate_limit"
        }
    
    except openai.error.InvalidRequestError as e:
        return {
            "response": "I apologize for the technical difficulty. Please contact our team directly at info@leelaprasadinternational.com or +91-9686995189 for immediate assistance.",
            "success": False,
            "error": str(e)
        }
    
    except Exception as e:
        print(f"Error in Leelaprasad AI Assistant: {e}")
        return {
            "response": "I apologize for the inconvenience. For immediate assistance, please reach out to our export team at info@leelaprasadinternational.com or call +91-9686995189.",
            "success": False,
            "error": str(e)
        }


def get_quick_response(query_type: str) -> Optional[str]:
    """
    Provides instant responses for common queries without API call
    Saves API costs and improves response time
    """
    kb = LeelaprasadKnowledgeBase
    
    quick_responses = {
        "contact": f"""You can reach Leelaprasad International through:
        
📧 Email: {kb.CONTACT_INFO['head_office']['email']}
📞 Phone: {kb.CONTACT_INFO['head_office']['phone']}
🏢 Head Office: {kb.CONTACT_INFO['head_office']['address']}

Our export team is ready to assist with your coffee sourcing needs!""",
        
        "products": f"""We offer three main product categories:

1. **Green Coffee Beans** (Arabica & Robusta) - {kb.PRODUCTS['green_coffee_beans']['count']}
2. **Roasted Coffee Beans** - {kb.PRODUCTS['roasted_coffee_beans']['count']}
3. **Filter & Instant Coffee Powder** - {kb.PRODUCTS['filter_coffee_powder']['count']}

All products are certified and sourced from our {kb.CORE_FACTS['plantation_size']} and network of {kb.CORE_FACTS['farmer_network']}.

Would you like details about a specific product category?""",
        
        "certifications": f"""Leelaprasad International holds the following certifications:

{chr(10).join(f'✓ {cert}' for cert in kb.CERTIFICATIONS)}

These certifications ensure our coffee meets the highest international quality and safety standards. We maintain a {kb.CORE_FACTS['quality_record']}.
"""
    }
    
    return quick_responses.get(query_type)


# Example usage with conversation management
class ConversationManager:
    """Manages conversation history for context-aware responses"""
    
    def __init__(self, max_history: int = 10):
        self.conversations = {}
        self.max_history = max_history
    
    def add_message(self, session_id: str, role: str, content: str):
        """Add a message to conversation history"""
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        
        self.conversations[session_id].append({
            "role": role,
            "content": content
        })
        
        # Trim history if too long
        if len(self.conversations[session_id]) > self.max_history * 2:
            self.conversations[session_id] = self.conversations[session_id][-self.max_history * 2:]
    
    def get_history(self, session_id: str) -> list:
        """Get conversation history for a session"""
        return self.conversations.get(session_id, [])
    
    def clear_history(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversations:
            del self.conversations[session_id]


# Initialize global conversation manager
conversation_manager = ConversationManager()


def chat_with_context(user_message: str, session_id: str) -> Dict:
    """
    Chat with conversation context management
    """
    # Get conversation history
    history = conversation_manager.get_history(session_id)
    
    # Check for quick responses first (saves API costs)
    user_lower = user_message.lower()
    if any(word in user_lower for word in ["contact", "email", "phone", "reach"]):
        quick_resp = get_quick_response("contact")
        if quick_resp:
            conversation_manager.add_message(session_id, "user", user_message)
            conversation_manager.add_message(session_id, "assistant", quick_resp)
            return {"response": quick_resp, "success": True, "source": "quick_response"}
    
    elif any(word in user_lower for word in ["product", "coffee beans", "what do you sell"]):
        quick_resp = get_quick_response("products")
        if quick_resp:
            conversation_manager.add_message(session_id, "user", user_message)
            conversation_manager.add_message(session_id, "assistant", quick_resp)
            return {"response": quick_resp, "success": True, "source": "quick_response"}
    
    elif "certification" in user_lower or "certified" in user_lower:
        quick_resp = get_quick_response("certifications")
        if quick_resp:
            conversation_manager.add_message(session_id, "user", user_message)
            conversation_manager.add_message(session_id, "assistant", quick_resp)
            return {"response": quick_resp, "success": True, "source": "quick_response"}
    
    # Use API for complex queries
    result = chat_with_leelaprasad(user_message, history)
    
    if result["success"]:
        # Add to conversation history
        conversation_manager.add_message(session_id, "user", user_message)
        conversation_manager.add_message(session_id, "assistant", result["response"])
        result["source"] = "ai_reasoning"
    
    return result