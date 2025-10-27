const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testEmailService() {
  console.log('📧 Testing Email Service...\n');

  try {
    // Test 1: Send simple email
    console.log('1. Testing simple email...');
    const simpleEmailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<h1>Hello World!</h1><p>This is a test email.</p>',
      text: 'Hello World! This is a test email.'
    };

    const simpleEmailResponse = await axios.post(`${API_BASE}/emails/send`, simpleEmailData, {
      headers: {
        'Authorization': 'Bearer your-test-token-here'
      }
    });
    console.log('✅ Simple email test:', simpleEmailResponse.data);
    console.log('');

    // Test 2: Send template email
    console.log('2. Testing template email...');
    const templateEmailData = {
      to: 'test@example.com',
      subject: 'Welcome to Our Service',
      template: 'thank-you',
      data: {
        name: 'John Doe',
        dashboardLink: 'https://proposal.com/dashboard'
      }
    };

    const templateEmailResponse = await axios.post(`${API_BASE}/emails/send-template`, templateEmailData, {
      headers: {
        'Authorization': 'Bearer your-test-token-here'
      }
    });
    console.log('✅ Template email test:', templateEmailResponse.data);
    console.log('');

    // Test 3: Send proposal sent email
    console.log('3. Testing proposal sent email...');
    const proposalSentData = {
      to: 'recipient@example.com',
      proposalData: {
        recipientName: 'Jane Smith',
        proposalTitle: 'Q1 Marketing Proposal',
        senderName: 'John Doe',
        sentDate: new Date().toLocaleDateString(),
        status: 'PENDING',
        proposalLink: 'https://proposal.com/proposal/123'
      }
    };

    const proposalSentResponse = await axios.post(`${API_BASE}/emails/send-proposal-sent`, proposalSentData, {
      headers: {
        'Authorization': 'Bearer your-test-token-here'
      }
    });
    console.log('✅ Proposal sent email test:', proposalSentResponse.data);
    console.log('');

    // Test 4: Send proposal signed email
    console.log('4. Testing proposal signed email...');
    const proposalSignedData = {
      to: 'sender@example.com',
      proposalData: {
        recipientName: 'John Doe',
        proposalTitle: 'Q1 Marketing Proposal',
        signerName: 'Jane Smith',
        signedDate: new Date().toLocaleDateString(),
        proposalLink: 'https://proposal.com/proposal/123'
      }
    };

    const proposalSignedResponse = await axios.post(`${API_BASE}/emails/send-proposal-signed`, proposalSignedData, {
      headers: {
        'Authorization': 'Bearer your-test-token-here'
      }
    });
    console.log('✅ Proposal signed email test:', proposalSignedResponse.data);
    console.log('');

    // Test 5: Send welcome email
    console.log('5. Testing welcome email...');
    const welcomeData = {
      to: 'newuser@example.com',
      userData: {
        name: 'New User',
        email: 'newuser@example.com'
      }
    };

    const welcomeResponse = await axios.post(`${API_BASE}/emails/send-welcome`, welcomeData, {
      headers: {
        'Authorization': 'Bearer your-test-token-here'
      }
    });
    console.log('✅ Welcome email test:', welcomeResponse.data);
    console.log('');

    console.log('🎉 All email tests completed!');

  } catch (error) {
    console.error('❌ Email test failed:', error.response?.data || error.message);
    console.log('\n💡 Note: Make sure the API server is running and email credentials are configured.');
  }
}

// Run the test
testEmailService();
