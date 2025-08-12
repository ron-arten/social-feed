//
//  PendoAppDelegate.m

#import "PendoAppDelegate.h"
#import <ExpoModulesCore/EXModuleRegistryProvider.h>
#import <Pendo/PendoManager.h>

@implementation PendoAppDelegate
EX_REGISTER_SINGLETON_MODULE(PendoAppDelegate)

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    if ([[url scheme] containsString:@"pendo"]) {
        [[PendoManager sharedManager] initWithUrl:url];
        return YES;
    }
    return NO;
}

@end
