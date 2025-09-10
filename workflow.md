Peer1 
    1. creates a pc
    2. registers event.     
        onicecandidate (send them to ws). 
        connectionstatechange ()
        signalingstatechange ()
        iceconnectionstatechange ()
    3. open a data channel and register events on variable (message, open, close)
    4. create local offer
    5. p1 set local description with offer.
    6. p1 send offer to ws

Peer 2
    7. initialize  pc (same as p1)
    8. register events (same as p1)
    9. register data channel events (on pc.ondatachannel)
    10. == IMP P2 RECEIVES OFFER FROM P2 
    11. sets remote description with incomming offer
    12. create answer
    13. set local description (with answer)
    14. send answer to p1

Peer 1
    15. Accept Answer from p2 in remote_description

Peer1 and Peer2
    16. Both accept each other ice_candidates.


IMPORTANT DISCUSSION
1. MUST SET REMOTE DESCRIPTION BEFORE ADDING OTHER PARTY ICE_CANDIDATES.
    Reason: Remote_description what are we doing. ice candidate tell path.
    path with not knowing what to do is meaningless.

2. WHEN EXACTLY DO WE KNOW OUR CONNECTION IS SUCCESSFUL
    When candidates are exchanged, during this time, connection would be made auto.
    And relevent events would be fired telling us connection is made.
    They are:
        1. dataChannel open event  [Best Option]
        2. pc connectionState becomes connected (pc.onconnectionsstatechange)
            But it doesnot means data connection is open yet. so Option 1 is better.

3. Know when other user has clicked on disconnect.  [Is it ? in course he said. will check myself]
    We need to differenciate if other user has clicked disconnected or is there a connection problem.


4. IMPORTANT EVENTS
    1. onicecandidate 
        When a new candidate is found
    When it fires ? After : createoffer or createanswer

    2. onconnectionstatechange
        monitor overall connection state
        Values:
            "new" – just created
            "checking" – gathering candidates
            "connected" – successfully connected
            "disconnected" – temporarily lost
            "failed" – permanent failure
            "closed" – explicitly closed

    3. onsignalingstatechange    [MY FAVOURITE]
        Tracks the state of the signaling process (SDP negotiation).
        When it fires ?
            After calling setLocalDescription(), setRemoteDescription(), or createOffer()/createAnswer()
        Values: 
            "stable" – negotiation complete or idle
            "have-local-offer" – after setting local offer
            "have-remote-offer" – after setting remote offer
            "have-local-pranswer" – rare, during early answer negotiation
            "have-remote-pranswer"
            "closed" – connection closed

    4. oniceconnectionstatechange  [2ND FAVOURITE]
        Tracks the state of the ICE connection itself (NAT traversal and connectivity checks).
        When it fires:
            When ICE connectivity status changes (e.g., when STUN/TURN checks succeed or fail).
        Values:
            "new" – ICE agent created
            "checking" – gathering candidates / checking connectivity
            "connected" – ICE connection established
            "completed" – all checks done (only seen in some cases)
            "disconnected" – lost connectivity
            "failed" – ICE connection failed (bad network / firewall)
            "closed" – connection closed

    5. Data Channel events registered
        both p1 and p2 need to register events differently.
        for p1 (creator of channel), must add events on newly created var
        for p2, it will do pc.ondatachannel
            bcz pc.ondatachannel only fires when a data channel is received. a bit wired, i know.
            No ondatachannel event will fire on P1. Ever.

